import { Component, computed, effect, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { IconComponent } from '../../../../icon/icon.component';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { RatingComponent } from '../../../rating/rating.component';
import { Movie } from '../../../../../core/interfaces/movie/movie.interface';
import { MinutesToTimePipe } from '../../../../pipes/minutes-to-time/minutes-to-time.pipe';
import { RouterLink } from '@angular/router';
import { getKeyTrailer } from '../../../../utils/helpers';
import { style} from '@angular/animations';
import { AnimationsService } from '../../../../../core/services/animations/animations.service';

@Component({
  selector: 'app-banner-movie-details',
  imports: [IconComponent, NgOptimizedImage, RatingComponent,MinutesToTimePipe, DatePipe, RouterLink],
  templateUrl: './banner-movie-details.component.html',
  styleUrl: './banner-movie-details.component.css',
})
export class BannerDetailComponent {

  readonly movie = input.required<Movie>()
  readonly activeIndex = input.required<number>()
  readonly cardIndex = input<number>()
  readonly onPlayTailer = output<void>()

  private readonly animationsService = inject(AnimationsService);

  private readonly metadata = viewChild.required<ElementRef<HTMLElement>>('metadata')
  private readonly overview = viewChild.required<ElementRef<HTMLElement>>('overview')
  private readonly buttons = viewChild.required<ElementRef<HTMLElement>>('buttons')

  readonly currentTrailerKey = computed(() =>
    getKeyTrailer(this.movie().videos)
  );

  changeMovie = effect(() => {
  console.log('imagenes', this.movie().images)

    if (this.cardIndex() === this.activeIndex())
      this.animateIn()
  })

  playTrailer(): void {
    this.onPlayTailer.emit()
  }

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
      style({ opacity: 0, transform: 'translateX(-60%)' }),
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

 }
