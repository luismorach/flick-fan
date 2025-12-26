import { DatePipe } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, untracked, viewChild } from '@angular/core';
import { Serie } from '../../../../../core/interfaces/serie/serie.interface';
import { AutoImagePipe } from '../../../../pipes/autoimage/auto-image.pipe';
import { RatingComponent } from '../../../rating/rating.component';
import { IconComponent } from '../../../../icon/icon.component';
import { RouterLink } from '@angular/router';
import { animate, AnimationBuilder, style } from '@angular/animations';
import { getKeyTrailer } from '../../../../utils/helpers';
import { FloatTrailerService } from '../../../../../core/services/float-trailer/float-trailer.service';

@Component({
  selector: 'app-banner-details',
  imports: [AutoImagePipe, RatingComponent, IconComponent, DatePipe, RouterLink],
  templateUrl: './banner-details.component.html',
  styleUrl: './banner-details.component.css',
})
export class BannerDetailsComponent {
  readonly serie = input.required<Serie>()
  builder = inject(AnimationBuilder);
  private readonly floatTrailer = inject(FloatTrailerService);
  private readonly metadata = viewChild.required<ElementRef<HTMLElement>>('metadata')
  private readonly overview = viewChild.required<ElementRef<HTMLElement>>('overview')
  private readonly buttons = viewChild.required<ElementRef<HTMLElement>>('buttons')

  readonly currentTrailerKey = computed(() => {
    return getKeyTrailer(this.serie().videos)
  }
  );

  changeSerie = effect(() => {
    const serie = this.serie()
    this.floatTrailer.setVideoKey(this.currentTrailerKey())
    requestAnimationFrame(() => this.animateIn());
  })

  private animateIn() {
    let animation = this.builder.build([
      style({ opacity: 0, transform: 'translateX(-150%)' }),
      animate('300ms 300ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
    ]);
    let player = animation.create(this.metadata().nativeElement);
    player.play();

    animation = this.builder.build([
      style({ opacity: 0, transform: 'translateY(100%)' }),
      animate('500ms 500ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
    ]);
    player = animation.create(this.overview().nativeElement);
    player.play();

    animation = this.builder.build([
      style({ opacity: 0, transform: 'translateY(3%)' }),
      animate('700ms 700ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
    ]);
    player = animation.create(this.buttons().nativeElement);
    player.play();

  }

  playTrailer(): void {
    this.floatTrailer.showFloatTrailer(this.currentTrailerKey())
  }
}
