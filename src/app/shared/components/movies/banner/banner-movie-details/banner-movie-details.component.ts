import { Component, computed, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { IconComponent } from '../../../../icon/icon.component';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { RatingComponent } from '../../../customs-elements/rating/rating.component';
import { Movie } from '../../../../../core/interfaces/movie/movie.interface';
import { MinutesToTimePipe } from '../../../../pipes/minutes-to-time/minutes-to-time.pipe';
import { RouterLink } from '@angular/router';
import { getKeyTrailer } from '../../../../utils/helpers';
import { style } from '@angular/animations';
import { AnimationsService } from '../../../../../core/services/animations/animations.service';
import { CarouselService } from '../../../../../core/services/carousel/carousel-service';
import { FloatTrailerService } from '../../../../../core/services/float-trailer/float-trailer.service';

@Component({
  selector: 'app-banner-movie-details',
  imports: [IconComponent, NgOptimizedImage, RatingComponent, MinutesToTimePipe, DatePipe, RouterLink],
  templateUrl: './banner-movie-details.component.html',
  styleUrl: './banner-movie-details.component.css',
})
export class BannerDetailComponent {

  readonly movie = input.required<Movie>()
  readonly carouselService = input.required<CarouselService<any, any>>()
  readonly index = input<number>()

  private readonly animationsService = inject(AnimationsService);
  private readonly floatTrailer = inject(FloatTrailerService);

  private readonly metadata = viewChild.required<ElementRef<HTMLElement>>('metadata')
  private readonly overview = viewChild.required<ElementRef<HTMLElement>>('overview')
  private readonly buttons = viewChild.required<ElementRef<HTMLElement>>('buttons')

  readonly currentTrailerKey = computed(() =>
    getKeyTrailer(this.movie().videos)
  );

  changeMovie = effect(() => {
    //console.log('imagenes', this.movie().images)
    //console.log('tamaño de pantalla',this.carouselService().state().slidesInfo.layout().slideMainAxisSize)
    const activeIndex = this.carouselService().state().activeIndex?.()
    if (this.index() === activeIndex)
      this.animateIn()
  })

  playTrailer(): void {
    const element = this.carouselService().state().currentElement
    if (!element) return
    console.log('reproduciendo el trailer', element)
    this.floatTrailer.register(this, element)
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
