import { ChangeDetectionStrategy, Component, effect, inject, signal, } from '@angular/core';
import { FloatTrailerService } from '../../../core/services/float-trailer/float-trailer.service';
import { YouTubePlayer } from '@angular/youtube-player';

const YOUTUBE_PLAYER_CONFIG: YT.PlayerVars = {
  autoplay: 1,
  iv_load_policy: 3,
  mute: 1,
  showinfo: 0,
  modestbranding: 1,
  cc_load_policy: 0,
  rel: 0,
  fs: 0,
  disablekb: 1,
};

@Component({
  selector: 'app-play-trailer',
  imports: [YouTubePlayer],
  templateUrl: './play-trailer.component.html',
  styleUrl: './play-trailer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export default class PlayTrailerComponent {
  readonly svc = inject(FloatTrailerService)
  readonly videoKey = this.svc.videoKey;
  readonly playerVars: YT.PlayerVars = YOUTUBE_PLAYER_CONFIG
  readonly hasError = signal(false)

  changeVideoKey = effect(() => {
    this.videoKey(); // Track videoKey changes
    this.hasError.set(false);
  });

  onPlayerError(event: YT.OnErrorEvent): void {
    console.error('[PlayTrailerComponent] Player error:', event.data);
    this.hasError.set(true);
  }
}