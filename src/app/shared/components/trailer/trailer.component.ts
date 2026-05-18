import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal, viewChild, WritableSignal, } from '@angular/core';
import { FloatTrailerService } from '../../../core/services/float-trailer/float-trailer.service';
import { YouTubePlayer } from '@angular/youtube-player';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { fadeIn, fadeInButton } from '../../animations/animations';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { filter, take } from 'rxjs';
import { IconComponent } from "../../icon/icon.component";

const FLOAT_YOUTUBE_PLAYER_CONFIG: YT.PlayerVars = {
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

const EMBED_YOUTUBE_PLAYER_CONFIG: YT.PlayerVars = {
  controls: 0,
  autoplay: 1,
  iv_load_policy: 3,
  mute: 1,
  showinfo: 0,
  modestbranding: 1,
  cc_load_policy: 0,
  origin: window.location.origin,
  enablejsapi: 1,
}

type TrailerMode = 'float' | 'embed';

@Component({
  selector: 'app-trailer',
  imports: [YouTubePlayer, NgClass, CdkDrag, IconComponent],
  templateUrl: './trailer.component.html',
  styleUrl: './trailer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, fadeInButton]
})

export default class TrailerComponent {
  readonly svc = inject(FloatTrailerService)
  private readonly router = inject(Router)

  videoKey = signal('')
  mode:WritableSignal<TrailerMode> = signal('float')
  readonly playerVars: Signal<YT.PlayerVars> = computed(() =>
    (this.mode() === 'float' ? FLOAT_YOUTUBE_PLAYER_CONFIG : EMBED_YOUTUBE_PLAYER_CONFIG)
  )
  readonly hasError = signal(false)
  mutedState = signal(true)

  private readonly player = viewChild.required(YouTubePlayer)
  readonly drag = viewChild.required(CdkDrag)

  ngAfterViewInit() {
    if (this.mode() === 'float') {
      this.setupRemoveTransitionOnDrag()
    }else{
      this.setupAutoCloseOnEndTrailerEmbed()
    }
  }

  private setupRemoveTransitionOnDrag() {
    const el = this.drag().element.nativeElement;
    this.drag().started.subscribe(() => {
      el.classList.remove('player-frame-transition');
    });

    this.drag().ended.subscribe(() => {
      el.classList.add('player-frame-transition');
    });
  }

  private setupAutoCloseOnEndTrailerEmbed(){
    this.player().stateChange.pipe(
        filter(state => state.data === YT.PlayerState.ENDED),
        take(1),
      )
        .subscribe(() => this.svc.detachTrailerEmbed());
  }

  onPlayerError(event: YT.OnErrorEvent): void {
    console.error('[PlayTrailerComponent] Player error:', event.data);
    this.hasError.set(true);
  }

  changeMuted(event: Event) {
    this.mutedState.update(muted => !muted);
    (this.mutedState()) ? this.player().mute() : this.player().unMute();
    event.stopPropagation()
  }

  redirectDetailsMovie(id: number) {
    this.router.navigate(['/details-movie/' + id])
  }

  redirectDetailsSerie(id: number) {
    this.router.navigate(['/details-serie/' + id])
  }
}