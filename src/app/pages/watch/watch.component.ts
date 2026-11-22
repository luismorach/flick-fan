import { DatePipe, DecimalPipe, DOCUMENT, NgOptimizedImage, UpperCasePipe } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, signal, untracked, viewChild, WritableSignal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, map, switchMap, of, tap, filter, catchError, EMPTY } from 'rxjs';
import { MovieList, Movie } from '../../core/interfaces/movie/movie.interface';
import { ApiService } from '../../core/services/API/api.service';
import { Season, Serie } from '../../core/interfaces/serie/serie.interface';
import { UrlSafePipe } from '../../shared/pipes/url-safe/url-safe.pipe';
import { IconComponent } from '../../shared/icon/icon.component';
import { getComputedTitle, getComputedTitleImageUrl, isMovie } from '../../shared/utils/helpers';
import { MinutesToTimePipe } from '../../shared/pipes/minutes-to-time/minutes-to-time.pipe';
import { CustomSelectComponent } from '../../shared/components/customs-elements/custom-select/custom-select.component';
import { StreamApiServiceService } from '../../core/services/API/stream-api/stream-api.service.service';
import { Stream } from '../../core/interfaces/stream/stream.interface';
import { MediaEvaluation } from '../../core/interfaces/media-evaluation/media-evaluation.interface';
import { MediaCapabilityService } from '../../core/services/player/media-capability/media-capability';
import { MsePlayerService } from '../../core/services/player/mse-player/mse-player.service';
import { environment } from '../../core/environment/environment';

@Component({
  selector: 'app-watch',
  imports: [UrlSafePipe, IconComponent, NgOptimizedImage, MinutesToTimePipe, DatePipe, DecimalPipe,
    CustomSelectComponent, RouterLink, UpperCasePipe],
  templateUrl: './watch.component.html',
  providers:[MsePlayerService],
  styleUrl: './watch.component.css'
})
export default class WatchComponent {

  private route = inject(ActivatedRoute)
  private api = inject(ApiService)
  private streamAPi = inject(StreamApiServiceService)
  private msePlayerService = inject(MsePlayerService)
  private readonly mediaCapability = inject(MediaCapabilityService)
  card = viewChild<ElementRef<HTMLElement>>('card')
  backdrop = viewChild<ElementRef<HTMLElement>>('backdrop')
  private video = viewChild<ElementRef<HTMLVideoElement>>('video')
  test: { name: string, id: number } = { name: 'name', id: 0 }

  isMovie = isMovie
  selectedSeason: WritableSignal<Season | undefined> = signal(undefined)


  protected type = toSignal(this.route.params.pipe(
    map(params => params['type'] as 'movie' | 'serie'),
  ));

  protected id = toSignal(this.route.params.pipe(
    map(params => params['id'] as number)),
    { initialValue: undefined }
  );

  seasonNumber = toSignal(this.route.params.pipe(
    map(params => params['season_number'] as number)),
    { initialValue: 0 }
  );

  episodeNumber = toSignal(this.route.params.pipe(
    map(params => params['episode_number'] as number)),
    { initialValue: 0 }
  );

  media = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => this.api.getDetails<Movie | Serie>({ dataId: id, type: this.type() })),
      tap((data) => {
        if (!isMovie(data)) this.selectedSeason.set(data?.seasons[this.seasonNumber()])
      })),
    { initialValue: undefined }
  );

  torrentsParams = computed(() => {
    const media = this.media()
    const type = this.type()
    if (!media || !type) return { imdb_id: undefined, type: undefined }
    const imdb_id = isMovie(media) ? media.imdb_id : media.external_ids?.imdb_id
    return {
      imdb_id,
      type
    }
  })

  torrents = toSignal(
    toObservable(this.torrentsParams).pipe(
      filter(({ imdb_id, type }) => !!imdb_id && !!type),
      switchMap(({ imdb_id, type }) => this.streamAPi.getTorrents({ dataId: imdb_id, type }))
    ),
    { initialValue: undefined }
  )

  title = getComputedTitle(this.media)

  titleImage = getComputedTitleImageUrl(this.media)

  seasonParams = computed(() => ({
    id: this.media()?.id,
    season: this.selectedSeason()
  }));

  season = toSignal(
    toObservable(this.seasonParams).pipe(
      filter(({ id, season }) => !!id && !!season),
      switchMap(({ id, season }) => this.api.getSeason({ dataId: id }, season?.season_number ?? 1)),
    ),
    { initialValue: undefined }
  );

  url_media = computed(() => {
    const type = this.type()
    const id = this.id()
    if (!type || !id) return ''
    if (type === 'movie') return `https://vidsrc.to/embed/movie/${id}`
    return `https://vidsrc.to/embed/tv/${id}/${this.seasonNumber()}/${this.episodeNumber()}`

  })

  move(value: string, event: Event) {

    const el = this.card()?.nativeElement
    const backdrop = this.backdrop()?.nativeElement
    if (!el || !backdrop) return


    const index = value === '0%' ? '30' : '0'
    console.log('el valor es ', value, backdrop, index)

    el.style.transform = ` translateX(${value})`
    backdrop.style.zIndex = index
  }

  getStream(stream: Stream) {
    const infoHash = stream.infoHash
    console.log(stream.infoHash)

    this.streamAPi.getInfoMedia(infoHash).pipe(
      switchMap(async ({ analysisId, info }) => {
        const evaluation: MediaEvaluation = {
          video: info.video ? await this.mediaCapability.evaluateVideo(info.video, 'mp4') : null,
          audio: await this.mediaCapability.evaluateAudio(info.audioTracks ?? [], 'mp4'),
        };
        return { analysisId, evaluation };
      }),
      switchMap(({ analysisId, evaluation }) => this.streamAPi.processStream(analysisId, evaluation)),
      catchError(err => { console.error(err); return EMPTY; })
    ).subscribe((res: any) => {
      console.log(res)
      const evaluation = res.evaluation
      const info = res.info
      const url = `${environment.stream.API_URL}${res.playUrl}`
      const durationSec = res.info.durationSec
      const mimeType = this.mediaCapability.resolveOutputMimeType(info, evaluation)
       console.log('to init',url,durationSec,mimeType)
      this.initPlayer(url, mimeType, durationSec)
    });
  }

  initPlayer(url: string, mimeType: string, durationSec: number | null) {
    const video = this.video()?.nativeElement
    if (!video || url.length === 0 || mimeType.length === 0 || !durationSec) return
    // 3. Iniciamos el reproductor MSE

    this.msePlayerService.initMsePlayer(video, url, mimeType, durationSec);
  }

  constructor() {
  }
}
