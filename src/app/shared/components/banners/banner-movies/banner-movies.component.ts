import {
  Component, inject, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, ElementRef,
  input, viewChild, computed, effect,
  viewChildren
} from '@angular/core';
import { fade } from '../../../animations/animations';
import { BannerSkeletonComponent } from './banner-skeleton/banner-skeleton.component';
import { MovieList } from '../../../../core/interfaces/movie/movie.interface';
import { CarouselNavigationComponent } from "../../carousel/carousel-navigation/carousel-navigation.component";
import { BannerDetailComponent } from "./banner-movie-details/banner-movie-details.component";
import { getKeyTrailer } from '../../../utils/helpers';
import { FloatTrailerService } from '../../../../core/services/float-trailer/float-trailer.service';
import { CarouselOptions } from '../../../../core/interfaces/shared/carousel-interface';
import { CarouselService } from '../../../../core/services/carousel/carousel-service';
import { WithDetails } from '../../../utils/data-loaders/enhancers/with-details';
import { hasPagination, withPagination } from '../../../utils/data-loaders/enhancers/with-pagination';
import { useDataLoader } from '../../../utils/data-loaders/use-data-loader';
import { hasInfiniteScroll, withInfiniteScroll } from '../../../utils/data-loaders/enhancers/with-infinite-scroll';

@Component({
  selector: 'app-banner-movies',
  imports: [BannerSkeletonComponent, CarouselNavigationComponent, BannerDetailComponent],
  providers: [CarouselService],
  templateUrl: './banner-movies.component.html',
  styleUrl: './banner-movies.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade],
})

export default class BannerMoviesComponent {
  // Dependencies
  readonly carouselService = inject(CarouselService<MovieList, 'results'>);
  private readonly floatTrailer = inject(FloatTrailerService);

  // Inputs
  readonly movieList = input.required<MovieList | undefined>()

  // View Queries
  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carousel')
  private readonly sentinels = viewChildren<ElementRef<HTMLElement>>('sentinels')

  readonly loader = useDataLoader<MovieList, 'results'>('results', this.movieList).pipe(
    withInfiniteScroll,
    WithDetails,
  )


  private carouselOptions: CarouselOptions = {
    requiresEnrichment: true,
    slidesPerGroup: 1,
    orientation: 'horizontal',
    slidesConfig: {}
  }


  constructor() {
    if (hasInfiniteScroll(this.loader)) {
      this.loader.setupInfiniteScroll(this.sentinels, this.carouselContainer)
    }
    this.carouselService.initialize(this.carouselContainer, this.carouselOptions, this.loader)
  }
  playTrailer() {
    this.floatTrailer.register(this, this.carouselService.state().currentElement)
    //this.floatTrailer.playTest(this.carouselService.state().currentElement)
  }

  canLoadMore() {
    return hasPagination(this.loader) && this.loader.canLoadMore()
  }

  /* ngOnDestroy(){
    this.floatTrailer.hideFloatTrailer()
  } */
}






