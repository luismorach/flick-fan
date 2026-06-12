import {
  ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject,
  input,
  viewChild,
  viewChildren,
} from '@angular/core';
import { CardMovieComponent } from './card-movie/card-movie.component';
import { MovieList } from '../../../../core/interfaces/movie/movie.interface';
import { fade } from '../../../animations/animations';
import { CarouselNavigationComponent } from '../carousel-navigation/carousel-navigation.component';
import { CarouselMoviesSkeletonComponent } from './carousel-skeleton/carousel-movies-skeleton.component';
import { CarouselOptions } from '../../../../core/interfaces/shared/carousel-interface';
import { CdkScrollable } from "@angular/cdk/scrolling";
import { NgClass } from '@angular/common';
import { useSlideExpansion } from '../../../utils/use-slide-expansion';
import { useDataLoader } from '../../../utils/data-loaders/use-data-loader';
import { CarouselService } from '../../../../core/services/carousel/carousel-service';
import { WithDetails } from '../../../utils/data-loaders/enhancers/with-details';
import { withInfiniteScroll } from '../../../utils/data-loaders/enhancers/with-infinite-scroll';

@Component({
  selector: 'app-carousel-movies',
  imports: [CardMovieComponent, CarouselMoviesSkeletonComponent, CarouselNavigationComponent,
    CdkScrollable, NgClass],
  providers: [CarouselService],
  templateUrl: './carousel-movies.component.html',
  styleUrl: './carousel-movies.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade]
})

export class CarouselMoviesComponent {
  // Inputs
  readonly movieList = input.required<MovieList | undefined>()
  readonly title = input.required<string>()
  readonly subtitle = input<string>()
  readonly zIndex = input<number>(20)

  // Dependencies
  readonly slideExpansion = useSlideExpansion()
  readonly carouselService = inject(CarouselService<MovieList, 'results'>);

  readonly loader = useDataLoader<MovieList, 'results'>('results', this.movieList)
    .with(withInfiniteScroll)
    .with(WithDetails)
    .build();

  // View Queries
  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carousel')
  private readonly sentinels = viewChildren<ElementRef<HTMLElement>>('sentinels')

  // State
  readonly carouselOptions: CarouselOptions = {
    requiresEnrichment: false,
    orientation: 'horizontal',
    slidesConfig: {
      slidesPerView: 1,
      peekSkeletonOffset: 1,
      peek: 24,
      spaceBetween: 10,
      slidesOffsetAfter: 10,
      slidesOffsetBefore: 10,
      breakpoints: {
        398: { slidesPerView: 1.5 },
        508: { slidesPerView: 2, },
        748: { slidesPerView: 3, peek: 32 },
        988: { slidesPerView: 4, peek: 44 },
        1388: { slidesPerView: 5 }
      }
    }
  }

  readonly cardClasses = computed(() => {
    const currentMovies = this.loader.data();
    const layout = this.carouselService.slidesInfo.layout();
    const slidesPerView = layout.slidesPerView;

    return currentMovies.map((_, i) => this.slideExpansion.getCardOriginClass(i, slidesPerView));
  });

  constructor() {
    this.loader.setupInfiniteScroll(this.sentinels, this.carouselContainer)
    this.carouselService.initialize(this.carouselContainer, this.carouselOptions, this.loader)
  }

}
