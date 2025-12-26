import {
  ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef, inject, input,
  viewChild
} from '@angular/core';
import { SwiperContainer } from 'swiper/element/bundle'
import { CardMovieComponent } from './card-movie/card-movie.component';
import { Movie, MovieList } from '../../../../core/interfaces/movie/movie.interface';
import { fade } from '../../../animations/animations';
import { useSkeletonSlides } from '../../../utils/use-skeleton-slides';
import { CarouselSkeletonComponent } from './carousel-skeleton/carousel-skeleton.component';
import { CarouselNavigationComponent } from '../carousel-navigation/carousel-navigation.component';
import { DataLoaderManager } from '../../../utils/data-loader-manager';
import { GridHelperService } from '../../../../core/services/grid-helper/grid-helper.service';
import { SwiperRegistryService } from '../../../../core/services/swiper-registry/swiper-registry.service';
import { SwiperOptions } from 'swiper/types';

@Component({
  selector: 'app-carousel-movies',
  imports: [CardMovieComponent, CarouselSkeletonComponent, CarouselNavigationComponent],
  providers: [DataLoaderManager],
  templateUrl: './carousel-movies.component.html',
  styleUrl: './carousel-movies.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade]
})

export class CarouselMoviesComponent {
  // Constants
  private static readonly SLIDE_WIDTH = 310;

  // Inputs
  readonly movieList = input.required<MovieList | undefined>()
  readonly title = input.required<string>()
  readonly zIndex = input<number>(20)

  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  //readonly swiperHelper = inject(SwiperHelper<Movie>);
  readonly gridHelper = inject(GridHelperService);
  private readonly swiperRegistry = inject(SwiperRegistryService);

  // View Queries
  readonly swiperContainer = viewChild<ElementRef<SwiperContainer>>('swiper');

  // State
  readonly slides = useSkeletonSlides(CarouselMoviesComponent.SLIDE_WIDTH, true);
 // readonly cardClasses = this.gridHelper.cardClassesMovies(this.swiperHelper.dataLoaderManager.data, this.slides)

  

  constructor() {
    
  }
}
