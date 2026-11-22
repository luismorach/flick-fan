import { inject, Injectable } from '@angular/core';
import { CodecStringService, OutputContainer } from '../codec/codec-string';
import { MediaCapabilityResult, VideoInfo, AudioTrack, MediaEvaluation } from '../../../interfaces/media-evaluation/media-evaluation.interface';

@Injectable({
  providedIn: 'root',
})
export class MediaCapabilityService {

  private codec = inject(CodecStringService)

  private async decode(config: MediaDecodingConfiguration) {
    try {
      return await navigator.mediaCapabilities.decodingInfo(config);
    } catch {
      return null; // config inválida => tratar como no soportado
    }
  }

  private toResult(
    base: Pick<MediaCapabilityResult, 'type' | 'codec' | 'streamIndex'>,
    r: MediaCapabilitiesDecodingInfo | null
  ): MediaCapabilityResult {
    const supported = r?.supported ?? false;
    const smooth = r?.smooth ?? false;
    return {
      ...base,
      supported,
      smooth,
      powerEfficient: r?.powerEfficient ?? false,
      action: supported && smooth ? 'copy' : 'transcode',
    };
  }

  async evaluateVideo(video: VideoInfo, container: OutputContainer): Promise<MediaCapabilityResult> {
    const base = { type: 'video' as const, codec: video.codec };
    const codec = this.codec.getVideoCodec(video, container);
    if (!codec) return this.toResult(base, null);

    const r = await this.decode({
      type: 'file',
      video: {
        contentType: `video/${container}; codecs="${codec}"`,
        width: video.width ?? 1920,
        height: video.height ?? 1080,
        bitrate: video.bitRate ?? 8_000_000, // fallback si ffprobe no lo informa
        framerate: video.fps ?? 24,
      },
    });
    return this.toResult(base, r);
  }

  async evaluateAudio(tracks: AudioTrack[], container: OutputContainer) {
    return Promise.all(tracks.map(async audio => {
      const base = { type: 'audio' as const, streamIndex: audio.streamIndex, codec: audio.codec };
      const codec = this.codec.getAudioCodec(audio, container);
      if (!codec) return this.toResult(base, null);

      const r = await this.decode({
        type: 'file',
        audio: {
          contentType: `audio/${container}; codecs="${codec}"`,
          channels: String(audio.channels ?? 2),
          bitrate: audio.bitRate,
          samplerate: audio.sampleRate,
        },
      });
      return this.toResult(base, r);
    }));
  }

  public resolveOutputMimeType(info: any, evaluation: MediaEvaluation): string {
    const codecs: string[] = [];

    if (info.video && evaluation.video) {
      if (evaluation.video.action === 'copy') {
        const vCodec = this.codec.getVideoCodec(info.video, 'mp4');
        if (vCodec) codecs.push(vCodec);
      } else {
        // libx264 con yuv420p usa High Profile por defecto
        codecs.push('avc1.640028');
      }
    }

    // Misma lógica que createPlan en tu backend: toma el primer track con streamIndex >= 0
    const validAudioTracks = (evaluation.audio ?? []).filter(
      a => Number.isInteger(a.streamIndex) && (a.streamIndex as number) >= 0
    );
    const chosenAudio = validAudioTracks[0];

    if (chosenAudio) {
      if (chosenAudio.action === 'copy') {
        const audioInfo = info.audioTracks?.find((t: any) => t.streamIndex === chosenAudio.streamIndex);
        const aCodec = audioInfo ? this.codec.getAudioCodec(audioInfo, 'mp4') : 'mp4a.40.2';
        if (aCodec) codecs.push(aCodec);
      } else {
        // Tu backend transcodifica a -c:a aac
        codecs.push('mp4a.40.2');
      }
    }

    return `video/mp4; codecs="${codecs.join(', ')}"`;
  }
}
