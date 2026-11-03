import { Component, computed, DestroyRef, effect, inject, input, untracked, viewChild } from '@angular/core';
import { ApiService } from '../../../../../core/services/API/api.service';
import { FloatTrailerService } from '../../../../../core/services/float-trailer/float-trailer.service';
import { Movie } from '../../../../../core/interfaces/movie/movie.interface';
import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { IconComponent } from '../../../../icon/icon.component';
import { RouterLink } from '@angular/router';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { getKeyTrailer } from '../../../../utils/helpers';
import { Videos } from '../../../../../core/interfaces/media/videos.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TooltipDirective } from '../../../../../core/directives/tooltip/tooltip.directive';

@Component({
  selector: 'app-card-movie-preview',
  imports: [NgOptimizedImage, IconComponent, DecimalPipe, DatePipe, RouterLink, CdkPortalOutlet, TooltipDirective],
  templateUrl: './card-movie-preview.component.html',
  styleUrl: './card-movie-preview.component.css'
})
export class CardMoviePreviewComponent {
  //inputs
  readonly movie = input.required<Movie>();
  readonly width = input.required<number>();

  //dependencies
  private readonly destroyRef = inject(DestroyRef)
  private readonly floatTrailer = inject(FloatTrailerService);
  private api = inject(ApiService)

  //view queries
  private readonly portalHost = viewChild<CdkPortalOutlet>(CdkPortalOutlet)

  protected readonly hasGenres = computed(() =>
    (this.movie().genres?.length ?? 0) > 0
  );
  protected readonly primaryGenre = computed(() =>
    this.movie().genres?.[0]?.name ?? ''
  );

  onAnimationEnd(event: AnimationEvent) {
    if (event.animationName.includes('card-enter')) {
      console.log('Animation ended for card-movie-preview:', event);

      const portal = this.portalHost()
      const movie = this.movie()
      if (!portal || !movie) return

      console.log('añadiendo trialer')
      this.api.getMovieVideos({ dataId: movie.id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((videos: Videos) => {
        const videoId = getKeyTrailer(videos)
        if (videoId) {
          this.floatTrailer.playTrailerEmbed(videoId, portal)
        }
      })
    }
  }
}
