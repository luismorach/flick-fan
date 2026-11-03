import { Component, computed, ElementRef, inject, input, viewChild, viewChildren } from '@angular/core';
import { ApiService } from '../../core/services/API/api.service';
import { Movie, MovieList } from '../../core/interfaces/movie/movie.interface';
import { Serie, SerieList } from '../../core/interfaces/serie/serie.interface';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap } from 'rxjs';
import { useDataLoader } from '../../shared/utils/data-loaders/use-data-loader';
import { withInfiniteScroll } from '../../shared/utils/data-loaders/enhancers/with-infinite-scroll';
import { CarouselOptions } from '../../core/interfaces/shared/carousel-interface';
import { CarouselService } from '../../core/services/carousel/carousel-service';
import { CarouselNavigationComponent } from '../../shared/components/carousel/carousel-navigation/carousel-navigation.component';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recomended',
  imports: [CarouselNavigationComponent, NgOptimizedImage, DatePipe],
  providers: [CarouselService],
  templateUrl: './recomended.component.html',
  styleUrl: './recomended.component.css'
})
export class RecomendedComponent {
  media = input.required<Movie | Serie | undefined>();
  private readonly api = inject(ApiService);
  private readonly router = inject(Router)
  readonly carouselService = inject(CarouselService<MovieList, 'results'>);

  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carouselSimilarMovies')
  private readonly sentinels = viewChildren<ElementRef<HTMLElement>>('sentinels')

  extraargs = computed(() => {
    return { dataId: this.media()?.id }
  } );

  recomended = toSignal(
    toObservable(this.media).pipe(
      switchMap(media => this.api.getRecomendedMovies({ dataId: media?.id }))
    ),
    { initialValue: undefined }
  );

  readonly recomendedLoader = useDataLoader<MovieList | SerieList, 'results'>('results', this.recomended, this.extraargs)
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
   // this.recomendedLoader.setupInfiniteScroll(this.sentinels, this.carouselContainer)
    this.carouselService.initialize(this.carouselContainer, this.carouselOptions, this.recomendedLoader)
  }

  redirect(id: number) {
    this.router.navigate(['/details-movie/', id])
  }

}
