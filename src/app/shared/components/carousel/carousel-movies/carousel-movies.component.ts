import {
  ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef, inject, input,
  viewChild, ViewEncapsulation
} from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle'
import { NgClass } from '@angular/common';
import { CardMovieComponent } from './card-movie/card-movie.component';
import { MovieList } from '../../../../core/interfaces/movie/movie.interface';
import { GridHelperService } from '../../../../core/services/grid-helper/grid-helper.service';
import { fade } from '../../../animations/animations';
import { SwiperHelper } from '../../../utils/swiper/swiper-helper';
import { useSkeletonSlides } from '../../../utils/use-skeleton-slides';
import { CarouselSkeletonComponent } from './carousel-skeleton/carousel-skeleton.component';
import { CarouselNavigationComponent } from '../carousel-navigation/carousel-navigation.component';

register();

@Component({
  selector: 'app-carousel-movies',
  imports: [NgClass, CardMovieComponent, CarouselSkeletonComponent,CarouselNavigationComponent],
  templateUrl: './carousel-movies.component.html',
  styleUrl: './carousel-movies.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade]
})

export class CarouselComponent {
  // Inputs
  readonly movieList = input.required<MovieList | undefined>()
  readonly title = input.required<string>()

  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  readonly gridHelper = inject(GridHelperService)

  // View Queries
  readonly swiperContainer = viewChild<ElementRef<SwiperContainer>>('swiper');

  // State
  readonly slides = useSkeletonSlides(320, true);
  readonly swiperHelper = new SwiperHelper<MovieList>(this.slides);
  private static zCounter = 10;
  zIndex: number;

  constructor() {
    this.swiperHelper.initialize(this.swiperContainer, this.movieList)
    this.zIndex = CarouselComponent.zCounter--;

    this.destroyRef.onDestroy(() => {
      this.swiperHelper.destroy()
    });
  }
}
