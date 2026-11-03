import { Component, computed, ElementRef, inject, input, viewChild, viewChildren } from '@angular/core';
import { SerieList } from '../../../../core/interfaces/serie/serie.interface';
import { MovieList } from '../../../../core/interfaces/movie/movie.interface';
import { CarouselOptions } from '../../../../core/interfaces/shared/carousel-interface';
import { withInfiniteScroll } from '../../../utils/data-loaders/enhancers/with-infinite-scroll';
import { useDataLoader } from '../../../utils/data-loaders/use-data-loader';
import { CarouselService } from '../../../../core/services/carousel/carousel-service';
import { CarouselNavigationComponent } from '../carousel-navigation/carousel-navigation.component';
import { DatePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { ParamsApi } from '../../../../core/interfaces/shared/params-http.interface';
import { CarouselComponent } from '../carousel.component';
import { CarouselHeaderComponent } from "../carousel-header/carousel-header.component";
import { CdkDragPlaceholder } from "@angular/cdk/drag-drop";
import { CardMovieComponent } from "../carousel-movies/card-movie/card-movie.component";
import { CardSerieComponent } from "../carousel-series/card-serie/card-serie.component";
import { CarouselMoviesSkeletonComponent } from "../carousel-movies/carousel-skeleton/carousel-movies-skeleton.component";
import { useSlideExpansion } from '../../../utils/use-slide-expansion';

@Component({
  selector: 'app-carousel-media',
  imports: [CarouselNavigationComponent, NgOptimizedImage, DatePipe, CarouselComponent, CarouselHeaderComponent,
    CdkDragPlaceholder, CardMovieComponent, CardSerieComponent, CarouselMoviesSkeletonComponent,NgClass],
  providers: [CarouselService],
  templateUrl: './carousel-media.component.html',
  styleUrl: './carousel-media.component.css'
})
export class CarouselMediaComponent {

  // Inputs
  readonly media = input.required<MovieList | SerieList | undefined>()
  readonly title = input.required<string>()
  readonly subtitle = input<string>()
  readonly paramsApi = input<ParamsApi>({})

  readonly carouselService = inject(CarouselService<MovieList, 'results'>);
  private readonly router = inject(Router)
readonly slideExpansion = useSlideExpansion()

  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carousel')
  private readonly sentinels = viewChildren<ElementRef<HTMLElement>>('sentinels')

  readonly loader = useDataLoader<MovieList | SerieList, 'results'>('results', this.media, this.paramsApi)
    .with(withInfiniteScroll)
    .build();

  readonly carouselOptions: CarouselOptions = {
    requiresEnrichment: false,
    orientation: 'horizontal',
    requireSnapMandatory: true,
    slidesConfig: {
      slidesPerView: 1,
      peek: 24,
      slidesOffsetBefore: 10,
      slidesOffsetAfter: 10,
      peekSkeletonOffset: 0,
      spaceBetween: 10,
      breakpoints: {
        420: { slidesPerView: 1.5 },
        480: { slidesPerView: 2 },
        640: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        988: { slidesPerView: 5 }
      }
    }
  }

  constructor() {
   // this.loader.setupInfiniteScroll(this.sentinels, this.carouselContainer)
    this.carouselService.initialize(this.carouselContainer, this.carouselOptions, this.loader)
  }

  readonly cardClasses = computed(() => {
    const currentMovies = this.loader.data();
    const layout = this.carouselService.slidesInfo.layout();
    const slidesPerView = 5;

    return currentMovies.map((_, i) => this.slideExpansion.getCardOriginClass(i,0, slidesPerView));
  });

  redirect(id: number) {
    this.router.navigate(['/details-movie/', id])
  }
}
