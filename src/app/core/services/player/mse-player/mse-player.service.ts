import { inject, Injectable, NgZone, OnDestroy, signal } from '@angular/core';

@Injectable()
export class MsePlayerService implements OnDestroy {

  private readonly zone = inject(NgZone);
  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;
  private objectUrl: string | null = null;
  private queue: Uint8Array<ArrayBuffer>[] = [];
  private abortController: AbortController | null = null;

  // ── Estado del seek ──
  private baseUrl = '';                 // URL de /stream/play/:id sin ?start
  private generation = 0;               // se incrementa en cada (re)inicio; invalida tareas viejas
  private downloadActive = false;       // hay un fetch descargando en este momento
  private needsSnap = false;            // tras un seek, alinear currentTime al inicio real del buffer

  private seekTimer?: ReturnType<typeof setTimeout>;
  private readonly SEEK_DEBOUNCE_MS = 250;
  private readonly WAIT_AHEAD_SEC = 10; // si el destino está a ≤10 s del final descargado, se espera
  private video: HTMLVideoElement | undefined = undefined

  /** Mensaje de error para la vista (null = todo bien) */
  readonly error = signal<string | null>(null);

  private readonly MAX_BUFFER_AHEAD_SEC = 20; // Máximo 20s descargados por delante
  private readonly DEBUG = true;                       // log periódico del estado
  private readonly MAX_QUEUE_BYTES = 8 * 1024 * 1024; // tope de la cola en memoria
  private readonly KEEP_BEHIND_SEC = 10;               // cuánto conservar ya reproducido
  private readonly WATCHDOG_MS = 2000;
  private readonly STALL_LIMIT_MS = 8000;              // sin avanzar pese a tener datos
  private readonly NET_STALL_MS = 30_000;              // conexión abierta sin recibir nada
  private readonly MAX_RETRIES = 3;
  private readonly END_TOLERANCE_SEC = 5;
  private readonly APPEND_SLICE_BYTES = 1024 * 1024;      // 1 MB por appendBuffer
  private readonly TARGET_AHEAD_BYTES = 32 * 1024 * 1024; // colchón futuro máx. en bytes
  private readonly SEEK_TIMEOUT_MS = 15_000;
  private readonly READ_SIZE = 256 * 1024;

  private aheadCapSec = this.MAX_BUFFER_AHEAD_SEC;     // tope dinámico (baja si la cuota se llena)
  private queueBytes = 0;
  private sessionBytes = 0;      // bytes descargados en la sesión actual
  private bytesPerSec = 0;       // bitrate estimado (bytes/s)
  private quotaRetryCount = 0;   // QuotaExceeded consecutivos
  private seekStartedAt = 0;     // cuándo empezó el seek actual
  private currentStart = 0;                            // desde dónde se pidió la descarga actual
  private retries = 0;
  private lastRetryAt = 0;
  private recovering = false;
  private lastChunkAt = 0;
  private lastTime = -1;
  private lastProgressAt = 0;
  private tick = 0;
  private watchdogTimer?: ReturnType<typeof setInterval>;
  private initArgs?: { video: HTMLVideoElement; url: string; mime: string; duration: number | null };

  public initMsePlayer(
    video: HTMLVideoElement | undefined,
    url: string,
    mimeType: string,
    totalDuration: number | null,
    startAt = 0
  ) {
    this.retries = 0;
    this.lastRetryAt = 0;
    // Fuera de la zona: el bucle de lectura no dispara detección de cambios en cada chunk
    this.zone.runOutsideAngular(() => this.init(video, url, mimeType, totalDuration, startAt));
  }

  private init(
    video: HTMLVideoElement | undefined,
    url: string,
    mimeType: string,
    totalDuration: number | null,
    startAt: number
  ) {
    if (!video) {
      this.error.set('No hay elemento <video> disponible');
      return;
    }

    this.teardown();
    this.error.set(null);

    if (!('MediaSource' in window) || !MediaSource.isTypeSupported(mimeType)) {
      this.error.set(`Formato no soportado por MSE: ${mimeType}`);
      console.error('[MSE] MIME no soportado:', mimeType);
      return;
    }

    this.video = video;
    this.baseUrl = url;
    this.initArgs = { video, url, mime: mimeType, duration: totalDuration };
    this.clearQueue();
    this.aheadCapSec = this.MAX_BUFFER_AHEAD_SEC;

    const ms = new MediaSource();
    this.mediaSource = ms;
    this.objectUrl = URL.createObjectURL(ms);
    video.src = this.objectUrl;
    if (startAt > 0) video.currentTime = startAt; // tras recrear, retoma donde estaba

    video.addEventListener('error', this.onVideoError);
    video.addEventListener('loadedmetadata', this.onLoadedMetadata);
    video.addEventListener('seeking', this.onSeeking);
    video.addEventListener('timeupdate', this.onTimeUpdate);
    video.addEventListener('waiting', this.onWaiting);
    video.addEventListener('stalled', this.onStalled);

    ms.addEventListener('sourceended', () => console.warn('[MSE] sourceended', this.snapshot()));
    ms.addEventListener('sourceclose', () => console.warn('[MSE] sourceclose', this.snapshot()));

    ms.addEventListener('sourceopen', () => {
      if (this.mediaSource !== ms) return; // evento de un reproductor ya reiniciado

      if (totalDuration !== null && totalDuration > 0) {
        try {
          ms.duration = totalDuration;
        } catch (e) {
          console.warn('No se pudo fijar la duración todavía:', e);
        }
      }

      const sb = ms.addSourceBuffer(mimeType);
      this.sourceBuffer = sb;

      sb.addEventListener('updateend', () => {
        if (this.sourceBuffer !== sb) return;
        this.snapAfterSeek();
        this.processQueue();
      });
      sb.addEventListener('error', () => this.recover('error en SourceBuffer'));
      sb.addEventListener('abort', () => console.warn('[MSE] abort en SourceBuffer'));

      void this.startFrom(startAt);
    }, { once: true });

    this.startWatchdog();
  }

  private teardown() {
    this.generation++;
    this.abortController?.abort();
    this.abortController = null;
    clearTimeout(this.seekTimer);
    clearInterval(this.watchdogTimer);
    this.clearQueue();
    this.downloadActive = false;
    this.needsSnap = false;
    this.quotaRetryCount = 0;
    this.seekStartedAt = 0;
    this.sessionBytes = 0;

    const v = this.video;
    if (v) {
      v.removeEventListener('error', this.onVideoError);
      v.removeEventListener('loadedmetadata', this.onLoadedMetadata);
      v.removeEventListener('seeking', this.onSeeking);
      v.removeEventListener('timeupdate', this.onTimeUpdate);
      v.removeEventListener('waiting', this.onWaiting);
      v.removeEventListener('stalled', this.onStalled);

      // Libera decodificador y buffer de inmediato
      v.removeAttribute('src');
      v.load();
    }

    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }

    this.mediaSource = null;
    this.sourceBuffer = null;
  }

  private onVideoError = () => {
    const e = this.video?.error;
    console.error('[MSE] Error en <video>:', e?.code, e?.message, this.snapshot());
    this.recover(`error en <video> (código ${e?.code})`);
  };

  // Cada tick: reintenta appends pendientes y libera lo ya reproducido
  private onTimeUpdate = () => {
    this.evictBehind(this.KEEP_BEHIND_SEC, 2);
    this.processQueue();
  };

  private onWaiting = () => console.warn('[MSE] waiting', this.snapshot());
  private onStalled = () => console.warn('[MSE] stalled', this.snapshot());


  // 2. Intentar reproducir en cuanto haya datos suficientes
  private onLoadedMetadata = () => {
    console.log('Metadatos cargados. Duración:', this.video?.duration);
    this.video?.play().catch(err => console.warn('Autoplay bloqueado (haz clic en Play):', err));
  };

  // ───────────────────────── Seek ─────────────────────────

  private onSeeking = () => {
    this.seekStartedAt = Date.now(); // ← nueva
    clearTimeout(this.seekTimer);
    this.seekTimer = setTimeout(() => this.handleSeek(), this.SEEK_DEBOUNCE_MS);
  };

  private handleSeek() {
    if (!this.video || !this.sourceBuffer || !this.baseUrl) return;

    const target = this.video.currentTime;

    if (this.downloadActive && Math.abs(target - this.currentStart) < 1) return;
    // 1. Ya está en el buffer: el navegador lo resuelve solo
    if (this.isBuffered(target)) return;

    // 2. Justo por delante de lo descargado y el stream sigue activo: esperar a que llegue
    if (this.downloadActive && this.isJustAheadOfBuffer(target)) return;

    // 3. Cualquier otro caso: reiniciar la descarga desde el destino
    console.log(`⏩ Seek a ${target.toFixed(1)}s → reiniciando desde ese punto`);
    void this.startFrom(target);
  }

  private isBuffered(t: number): boolean {
    const b = this.sourceBuffer?.buffered;
    if (!b) return false;
    for (let i = 0; i < b.length; i++) {
      if (b.start(i) - 0.1 <= t && t < b.end(i)) return true;
    }
    return false;
  }

  private isJustAheadOfBuffer(t: number): boolean {
    const b = this.sourceBuffer?.buffered;
    if (!b) return false;
    for (let i = 0; i < b.length; i++) {
      if (b.end(i) <= t && t - b.end(i) <= this.WAIT_AHEAD_SEC) return true;
    }
    return false;
  }

  /**
   * Arranca (o reinicia) la descarga desde `start` segundos.
   * Orden: cancelar → vaciar cola → esperar buffer libre → borrar buffer →
   * abort() del parser → timestampOffset → fetch ?start=
   */
  private async startFrom(start: number, keep = false) {
    const sb = this.sourceBuffer;
    const ms = this.mediaSource;
    if (!sb || !ms) return;

    const gen = ++this.generation;

    this.abortController?.abort();
    this.abortController = new AbortController();
    this.clearQueue();
    this.downloadActive = false;
    this.currentStart = start;
    this.sessionBytes = 0;      // ← nueva
    this.quotaRetryCount = 0;   // ← nueva
    this.needsSnap = false;     // ← nueva: invalida snaps de seeks anteriores
    if (!keep) this.aheadCapSec = this.MAX_BUFFER_AHEAD_SEC;

    try {
      await this.waitIdle(sb);
      if (gen !== this.generation) return;

      if (!keep && sb.buffered.length > 0) {
        // Borrar TODOS los rangos, de atrás hacia adelante
        for (let i = sb.buffered.length - 1; i >= 0; i--) {
          sb.remove(sb.buffered.start(i), sb.buffered.end(i));
          await this.once(sb, 'updateend');
          if (gen !== this.generation) return;
        }
      }

      if (ms.readyState === 'open') sb.abort(); // reinicia el parser: acepta el nuevo init segment

      sb.timestampOffset = start;
      this.needsSnap = !keep;
    } catch (e) {
      console.error('[MSE] Error preparando la descarga:', e);
      this.recover('fallo preparando la descarga');
      return;
    }

    // ← NUEVO: alinear currentTime al destino con el buffer vacío, y marcar
    // que hay que hacer un snap al primer append (por el hueco del -ss de ffmpeg).
    if (!keep && this.video) {
      this.video.currentTime = start;
    }

    const url = start > 0 ? `${this.baseUrl}?start=${start.toFixed(3)}` : this.baseUrl;
    void this.fetchStream(url, gen);
  }

  /** Tras un seek, el primer dato puede empezar unas décimas después del destino. */
  private snapAfterSeek() {
    if (!this.needsSnap || !this.sourceBuffer || this.sourceBuffer.buffered.length === 0) return;
    if (!this.video) return;
    const t = this.video.currentTime;
    const b = this.sourceBuffer.buffered;
    for (let i = 0; i < b.length; i++) {
      if (b.start(i) - 0.5 <= t && t <= b.end(i)) { this.needsSnap = false; return; }
    }
    // Sin límite de distancia y sin guard de v.seeking: este snap ES lo que
    // completa el seek cuando el -ss de ffmpeg dejó un hueco.
    this.video.currentTime = b.start(0);
    this.needsSnap = false;
  }

  private async waitIdle(sb: SourceBuffer) {
    while (sb.updating) {
      await this.once(sb, 'updateend');
    }
  }

  private once(target: EventTarget, type: string): Promise<void> {
    return new Promise(resolve =>
      target.addEventListener(type, () => resolve(), { once: true })
    );
  }

  // ───────────────────────── Descarga y buffer ─────────────────────────

  private async fetchStream(url: string, gen: number) {
    const controller = this.abortController;
    if (!controller) return;

    this.downloadActive = true;
    this.lastChunkAt = Date.now();

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

      //const reader = response.body.getReader();
      const reader = response.body.getReader({
        mode: 'byob'
      });

      while (true) {
        // Contrapresión: por bytes en cola y por segundos por delante
        while (this.shouldPause(this.READ_SIZE)) {
          if (gen !== this.generation) return;
          this.lastChunkAt = Date.now(); // estar en pausa por contrapresión no es un corte de red
          await new Promise(resolve => setTimeout(resolve, 250));
        }

        //const { done, value } = await reader.read();
        const { done, value } = await reader.read(
          new Uint8Array(256 * 1024)
        );


        console.log('LEIDO', value?.byteLength)
        if (gen !== this.generation) return;

        if (done) {
          this.downloadActive = false;
          this.onStreamDone(gen);
          return;
        }

        if (value?.byteLength) {
          this.lastChunkAt = Date.now();
          this.sessionBytes += value.byteLength; // ← nueva
          this.enqueue(value as Uint8Array<ArrayBuffer>); // sin copiar
          console.log('[QUEUE AFTER]', {
            queueMB: +(this.queueBytes / 1048576).toFixed(2),
            chunks: this.queue.length
          });
          this.processQueue();
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || gen !== this.generation) return;
      this.downloadActive = false;
      console.error('[MSE] Error de red leyendo el stream:', err);
      this.recover('error de red');
    }
  }

  private effectiveAheadCap(): number {
    const mediaSec = this.bufferedEnd() - this.currentStart;
    if (mediaSec > 5) this.bytesPerSec = this.sessionBytes / mediaSec;
    let cap = this.aheadCapSec;
    if (this.bytesPerSec > 0) {
      cap = Math.min(cap, Math.max(8, this.TARGET_AHEAD_BYTES / this.bytesPerSec));
    }
    return cap;
  }

  private shouldPause(nextBytes = 0): boolean {
    if (this.queueBytes + nextBytes > this.MAX_QUEUE_BYTES) {
        return true;
    }

    return !!this.video &&
        this.getBufferedAhead(this.video.currentTime) >
        this.effectiveAheadCap();
}

  // ← MODIFICADO: maneja el hueco pequeño tras seek
  private getBufferedAhead(currentTime: number): number {
    if (!this.sourceBuffer) return 0;
    const buffered = this.sourceBuffer.buffered;

    if (buffered.length > 0 && currentTime < buffered.start(0)) {
      // Hueco pequeño (típico tras seek): contar el buffer entero como "ahead"
      if (buffered.start(0) - currentTime < 5) {
        return buffered.end(0) - currentTime;
      }
      return buffered.end(0) - buffered.start(0);
    }

    for (let i = 0; i < buffered.length; i++) {
      if (currentTime >= buffered.start(i) - 0.5 && currentTime <= buffered.end(i)) {
        return buffered.end(i) - currentTime;
      }
    }
    return 0;
  }

  private processQueue() {
    const ms = this.mediaSource;
    const sb = this.sourceBuffer;
    if (!ms || !sb || sb.updating || this.queue.length === 0) return;


    // Sin esto, un read() gigante infla el buffer hasta la cuota aunque el fetch esté pausado.
    if (this.video && this.getBufferedAhead(this.video.currentTime) > this.effectiveAheadCap()) return;

    // Antes: return silencioso. Con datos pendientes, un MediaSource no abierto es un fallo.
    if (ms.readyState !== 'open') {
      this.recover(`MediaSource "${ms.readyState}" con ${this.queue.length} chunks pendientes`);
      return;
    }

    try {
      sb.appendBuffer(this.queue[0]);
      this.dequeue(); // solo sale de la cola si entró bien
      this.quotaRetryCount = 0;
    } catch (e: any) {
      if (e?.name === 'QuotaExceededError') {
        this.onQuotaExceeded();
      } else {
        // Descartar el chunk rompería el MP4 fragmentado: es un error fatal
        console.error('[MSE] Error fatal en appendBuffer:', e, this.snapshot());
        this.recover(`appendBuffer: ${e?.name ?? e}`);
      }
    }
  }

  private onQuotaExceeded() {

    if (++this.quotaRetryCount > 3) {
      console.error('[MSE] QuotaExceeded en bucle → recover');
      this.quotaRetryCount = 0;
      this.recover('QuotaExceeded en bucle');
      return;
    }
    // 1. Intentar liberar en cascada
    const startedRemove =
      this.evictBehind(5, 0) ||
      this.evictBehind(1, 0)

    if (startedRemove) {
      // Red de seguridad: si updateend no dispara processQueue, reintentar en 1s.
      // processQueue es no-op si ya entró (chequea updating y queue.length).
      setTimeout(() => {
        if (this.queue.length > 0 && this.sourceBuffer && !this.sourceBuffer.updating) {
          console.warn('[MSE] Reintento de seguridad tras evict');
          this.processQueue();
        }
      }, 1000);
      return;
    }

    // 2. No hay nada que liberar: bajar el tope por delante
    const ahead = this.video ? this.getBufferedAhead(this.video.currentTime) : 0;
    this.aheadCapSec = Math.min(this.aheadCapSec, Math.max(10, Math.floor(ahead * 0.7)));

    // 3. Reintentar el append en el próximo tick
    const sb = this.sourceBuffer;
    if (sb && !sb.updating && this.queue.length > 0) {
      setTimeout(() => {
        if (this.sourceBuffer === sb && this.queue.length > 0 && !sb.updating) {
          console.warn('[MSE] Reintentando appendBuffer tras quota');
          this.processQueue();
        }
      }, 500);
    }

    console.warn(`[MSE] Cuota llena. Tope por delante → ${this.aheadCapSec}s`, this.snapshot());
    const b = sb?.buffered;
    const ranges: string[] = [];
    if (b) for (let i = 0; i < b.length; i++) ranges.push(`[${b.start(i).toFixed(1)}, ${b.end(i).toFixed(1)}]`);
    console.warn(`[MSE] buffered=${ranges.join(', ')} currentTime=${this.video?.currentTime.toFixed(1)}`);
  }

  /** Borra lo que quedó más de `keepSec` detrás de currentTime. Devuelve true si inició un remove. */
  private evictBehind(keepSec: number, minSec: number): boolean {
    const sb = this.sourceBuffer;
    const v = this.video;
    if (!sb || !v || sb.updating || sb.buffered.length === 0) return false;

    const cutoff = v.currentTime - keepSec;

    for (let i = sb.buffered.length - 1; i >= 0; i--) {
      const start = sb.buffered.start(i);
      const end = sb.buffered.end(i);

      // Rango completamente detrás del cutoff
      if (end <= cutoff) {
        sb.remove(start, end);
        return true;
      }

      // Rango que cruza el cutoff: borrar la parte de atrás
      if (start < cutoff) {
        if (cutoff - start > minSec) {
          sb.remove(start, cutoff);
          return true;
        }
      }

      // Rango huérfano delante de currentTime (gap > 30s)
      // Es basura de seeks anteriores; borrarlo libera cuota
      if (start > v.currentTime + this.MAX_BUFFER_AHEAD_SEC + 30) {
        sb.remove(start, end);
        return true;
      }
    }
    return false;
  }

  private onStreamDone(gen: number) {
    this.whenDrained(gen, () => {
      const dur = this.initArgs?.duration ?? null;
      const end = this.bufferedEnd();
      const earlyEnd = dur !== null && end < dur - this.END_TOLERANCE_SEC;

      // La conexión terminó antes de tiempo: retomar desde donde quedó, sin borrar lo bufferizado.
      // endOfStream() aquí encogería la duración al final del buffer.
      if (earlyEnd && this.retries < this.MAX_RETRIES) {
        console.warn(`[MSE] Stream terminó en ${end.toFixed(1)}s de ${dur!.toFixed(1)}s → retomando`);
        this.retries++;
        this.lastRetryAt = Date.now();
        void this.startFrom(end, true);
        return;
      }

      if (this.mediaSource?.readyState === 'open') this.mediaSource.endOfStream();
    });
  }

  private whenDrained(gen: number, cb: () => void) {
    if (gen !== this.generation || !this.sourceBuffer) return;

    if (!this.sourceBuffer.updating && this.queue.length === 0) {
      cb();
    } else {
      setTimeout(() => this.whenDrained(gen, cb), 100);
    }
  }

  // ── Cola ──

  private enqueue(chunk: Uint8Array<ArrayBuffer>) {
    console.log('[QUEUE BEFORE]', {
      incomingMB: +(chunk.byteLength / 1048576).toFixed(2),
      queueMB: +(this.queueBytes / 1048576).toFixed(2)
    });
    // MSE reensambla los fragments aunque cortes en cualquier byte.
    // Nunca confíes en el tamaño del chunk que devuelve reader.read().
    for (let off = 0; off < chunk.byteLength; off += this.APPEND_SLICE_BYTES) {
      const slice = chunk.subarray(off, off + this.APPEND_SLICE_BYTES); // sin copiar
      this.queue.push(slice);
      this.queueBytes += slice.byteLength;
    }
  }

  private dequeue() {
    const chunk = this.queue.shift();
    if (chunk) this.queueBytes -= chunk.byteLength;
  }

  private clearQueue() {
    this.queue = [];
    this.queueBytes = 0;
  }

  // ── Utilidades de buffer ──

  private bufferedEnd(): number {
    const b = this.sourceBuffer?.buffered;
    return b && b.length ? b.end(b.length - 1) : 0;
  }

  /** Desde dónde reanudar: al final del rango que contiene currentTime (conservándolo), o desde currentTime. */
  private resumePoint(): { start: number; keep: boolean } {
    const t = this.video?.currentTime ?? 0;
    const b = this.sourceBuffer?.buffered;

    if (b) {
      for (let i = 0; i < b.length; i++) {
        if (b.start(i) - 0.5 <= t && t <= b.end(i)) return { start: b.end(i), keep: true };
      }
    }
    return { start: t, keep: false };
  }

  // ── Diagnóstico ──

  snapshot() {
    const v = this.video;
    const sb = this.sourceBuffer;
    const ranges: [number, number][] = [];

    try {
      const b = sb?.buffered;
      if (b) for (let i = 0; i < b.length; i++) ranges.push([+b.start(i).toFixed(2), +b.end(i).toFixed(2)]);
    } catch { /* SourceBuffer ya desvinculado */ }

    return {
      msState: this.mediaSource?.readyState,
      updating: sb?.updating,
      queueChunks: this.queue.length,
      queueMB: +(this.queueBytes / 1048576).toFixed(1),
      buffered: ranges,
      currentTime: v ? +v.currentTime.toFixed(2) : null,
      videoReadyState: v?.readyState,
      paused: v?.paused,
      seeking: v?.seeking,
      videoError: v?.error?.code ?? null,
      downloadActive: this.downloadActive,
      aheadCapSec: this.aheadCapSec,
      retries: this.retries,
    };
  }

  // ── Vigilancia ──

  private startWatchdog() {
    clearInterval(this.watchdogTimer);
    this.lastTime = -1;
    this.lastProgressAt = Date.now();
    this.watchdogTimer = setInterval(() => this.checkHealth(), this.WATCHDOG_MS);
  }

  private checkHealth() {
    const v = this.video;
    if (!v) return;

    if (this.DEBUG && ++this.tick % 3 === 0) console.log('[MSE]', this.snapshot());

    // Conexión abierta pero sin recibir nada durante mucho tiempo
    if (this.downloadActive && Date.now() - this.lastChunkAt > this.NET_STALL_MS) {
      this.lastChunkAt = Date.now();
      this.recover('la conexión no recibe datos');
      return;
    }

    if (v.paused || v.ended || v.seeking) {
      // ← nuevo: un seek atascado no puede silenciar el watchdog para siempre
      if (v.seeking && this.seekStartedAt && Date.now() - this.seekStartedAt > this.SEEK_TIMEOUT_MS) {
        this.seekStartedAt = 0;
        this.recover('seek sin completar');
        return;
      }
      this.lastProgressAt = Date.now();
      return;
    }
    this.seekStartedAt = 0; // ← nueva: el seek ya terminó

    if (v.currentTime !== this.lastTime) {
      this.lastTime = v.currentTime;
      this.lastProgressAt = Date.now();
      if (this.retries > 0 && Date.now() - this.lastRetryAt > 30_000) this.retries = 0;
      return;
    }

    // currentTime no avanza. Si simplemente falta data y la descarga sigue viva, es espera normal.
    // PERO si hay chunks atascados en cola y el SourceBuffer no está ocupado, es un deadlock.
    const ahead = this.getBufferedAhead(v.currentTime);
    const queueStuck = this.queue.length > 0 && !this.sourceBuffer?.updating;
    if (ahead < 0.5 && this.downloadActive && !queueStuck) return;

    if (Date.now() - this.lastProgressAt > this.STALL_LIMIT_MS) {
      this.lastProgressAt = Date.now();
      this.recover(`reproducción detenida con ${ahead.toFixed(1)}s en buffer (queue=${this.queue.length})`);
    }
  }

  // ── Recuperación ──

  private recover(reason: string) {
    const now = Date.now();
    // Un fallo dispara varios eventos casi a la vez (SourceBuffer, video, cola): atender solo uno
    if (this.recovering || now - this.lastRetryAt < 1500) return;

    console.error('[MSE] Recuperando →', reason, this.snapshot());

    if (this.retries >= this.MAX_RETRIES) {
      this.error.set(`La reproducción se detuvo: ${reason}`);
      return;
    }

    this.retries++;
    this.lastRetryAt = now;

    const v = this.video;
    const args = this.initArgs;
    if (!v || !args) return;

    const healthy = this.mediaSource?.readyState === 'open' && !v.error && !!this.sourceBuffer;

    if (healthy && this.retries === 1) {
      // Primer intento: reanudar la descarga sin recrear nada
      const { start, keep } = this.resumePoint();
      this.recovering = true;
      this.startFrom(start, keep).finally(() => (this.recovering = false));
    } else {
      // MediaSource cerrado/terminado, <video> en error, o el primer intento no bastó: recrear todo
      this.init(args.video, args.url, args.mime, args.duration, v.currentTime);
    }
  }

  ngOnDestroy() {
    this.teardown()
  }
}