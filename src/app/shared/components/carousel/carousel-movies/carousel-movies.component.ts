import {
  ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject,
  input,
  viewChild,
  viewChildren,
} from '@angular/core';
import { CardMovieComponent } from './card-movie/card-movie.component';
import { Movie, MovieList } from '../../../../core/interfaces/movie/movie.interface';
import { fade } from '../../../animations/animations';
import { CarouselNavigationComponent } from '../carousel-navigation/carousel-navigation.component';
import { CarouselMoviesSkeletonComponent } from './carousel-skeleton/carousel-movies-skeleton.component';
import { CarouselOptions } from '../../../../core/interfaces/shared/carousel-interface';
import { CdkScrollable } from "@angular/cdk/scrolling";
import { NgClass } from '@angular/common';
import { useSlideExpansion } from '../../../utils/use-slide-expansion';
import { useDataLoader } from '../../../utils/data-loaders/use-data-loader';
import { CarouselService } from '../../../../core/services/carousel/carousel-service';
import { hasPagination, withPagination } from '../../../utils/data-loaders/enhancers/with-pagination';
import { canLoadDetails, WithDetails } from '../../../utils/data-loaders/enhancers/with-details';
import { canFilter, withFilter } from '../../../utils/data-loaders/enhancers/with-filter';

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
  readonly zIndex = input<number>(20)

  // Dependencies

  readonly slideExpansion = useSlideExpansion()
  readonly loader = useDataLoader<MovieList, 'results'>('results', this.movieList).pipe(
    withPagination,
    WithDetails,
    withFilter
  )

  readonly carouselService = inject(CarouselService<MovieList, 'results'>);

  // View Queries
  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carousel')
  private readonly slides = viewChildren<ElementRef<HTMLElement>>('slide')

  // State
  readonly carouselOptions: CarouselOptions = {
    requiresEnrichment: false,
    orientation: 'horizontal',
    slidesConfig: {
      slidesPerView: 1,
      peekSkeletonOffset: 1,
      peek: 24,
      spaceBetween: 24,
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

  /* x = effect(() => {
    this.loaderfiltrado.isInitialized()
    untracked(() => {
      const selectedGenreIds: number[] = []; // Acción y Aventura
      let genrePredicate
      if (selectedGenreIds.length === 0) {
        genrePredicate = null
      } else {
        genrePredicate = (movie: Movie) => {
          const genres = movie.genre_ids;
          return selectedGenreIds.some(id => genres.includes(id));
        };
      }

      this.loaderfiltrado.setFilterPredicate(genrePredicate)
      console.log('filteredData', this.loaderfiltrado.filteredData())
    })

  }) */

  canLoadMore() {
    return hasPagination(this.loader) && this.loader.canLoadMore()
  }
  constructor() {
    this.carouselService.initialize(this.carouselContainer, this.carouselOptions, this.loader)
  }

}
