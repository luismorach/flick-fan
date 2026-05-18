import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { Serie } from '../../../../../core/interfaces/serie/serie.interface';
import { AutoImagePipe } from '../../../../pipes/autoimage/auto-image.pipe';
import { RatingComponent } from '../../../rating/rating.component';
import { IconComponent } from '../../../../icon/icon.component';
import { RouterLink } from '@angular/router';
import { style } from '@angular/animations';
import { getKeyTrailer } from '../../../../utils/helpers';
import { FloatTrailerService } from '../../../../../core/services/float-trailer/float-trailer.service';
import { AnimationsService } from '../../../../../core/services/animations/animations.service';

@Component({
  selector: 'app-banner-details',
  imports: [AutoImagePipe, RatingComponent, IconComponent, DatePipe, RouterLink],
  templateUrl: './banner-details.component.html',
  styleUrl: './banner-details.component.css',
})
export class BannerDetailsComponent {
  readonly serie = input.required<Serie>()

  private readonly animationsService = inject(AnimationsService);

  readonly floatTrailer = inject(FloatTrailerService);
  private readonly metadata = viewChild.required<ElementRef<HTMLElement>>('metadata')
  private readonly overview = viewChild.required<ElementRef<HTMLElement>>('overview')
  private readonly buttons = viewChild.required<ElementRef<HTMLElement>>('buttons')

  readonly currentTrailerKey = computed(() => {
    return getKeyTrailer(this.serie().videos)
  }
  );

  changeSerie = effect(() => {
    const serie = this.serie()
    requestAnimationFrame(() => this.animateIn());
  })

  private animateIn() {
    const elements = [
      this.metadata().nativeElement,
      this.overview().nativeElement,
      this.buttons().nativeElement
    ];
    this.animationsService.resetAnimations(elements);

    // Metadata
    this.animationsService.playAnimation(
      this.metadata().nativeElement,
      style({ opacity: 0, transform: 'translateX(-150%)' }),
      '300ms 300ms ease'
    );

    // Overview
    this.animationsService.playAnimation(
      this.overview().nativeElement,
      style({ opacity: 0, transform: 'translateY(100%)' }),
      '500ms 500ms ease'
    );

    // Buttons
    this.animationsService.playAnimation(
      this.buttons().nativeElement,
      style({ opacity: 0, transform: 'translateY(3%)' }),
      '700ms 700ms ease'
    );
  }

  
  playTrailer(): void {
    this.floatTrailer.register(this, this.serie)
  }
}
