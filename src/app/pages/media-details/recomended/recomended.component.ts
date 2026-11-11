import { Component, computed, ElementRef, inject, input, viewChild, viewChildren } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, switchMap } from 'rxjs';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { Movie, MovieList } from '../../../core/interfaces/movie/movie.interface';
import { Serie, SerieList } from '../../../core/interfaces/serie/serie.interface';
import { CarouselOptions } from '../../../core/interfaces/shared/carousel-interface';
import { ApiService } from '../../../core/services/API/api.service';
import { CarouselComponent } from '../../../shared/components/carousel/carousel.component';
import { withInfiniteScroll } from '../../../shared/utils/data-loaders/enhancers/with-infinite-scroll';
import { useDataLoader } from '../../../shared/utils/data-loaders/use-data-loader';
import { isMovie } from '../../../shared/utils/helpers';

@Component({
  selector: 'app-recomended',
  imports: [NgOptimizedImage, DatePipe, CarouselComponent],
  templateUrl: './recomended.component.html',
  styleUrl: './recomended.component.css'
})

export class RecomendedComponent {
  readonly media = input.required<Movie | Serie | undefined>();
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private carousel = viewChild(CarouselComponent)
  isMovie = isMovie;

  extraargs = computed(() => {
    const media = this.media()
    if (!media) return { dataId: undefined, type: '' }
    const type = isMovie(media) ? 'recomended_movies' : 'recomended_series'
    return { dataId: media?.id, type: type }
  });

  recomended = toSignal(
    toObservable(this.extraargs).pipe(
      filter((args) => !!args.dataId && !!args.type),
      switchMap(args => this.api.getMediaList<MovieList | SerieList>(args))
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
      peek: 32,
      slidesOffsetBefore: 14,
      slidesOffsetAfter: 14,
      peekSkeletonOffset: 0,
      spaceBetween: 10,
      breakpoints: {
        420: { slidesPerView: 1.5 },
        480: { slidesPerView: 2 },
        640: { slidesPerView: 3 },
        768: { slidesPerView: 4, peek: 96 },
        988: { slidesPerView: 5, peek: 96 }
      }
    }
  }

  constructor() {
  }

  getTitle(data: Movie | Serie) {
    if (!data) return ''
    if (isMovie(data)) return data.title
    return data.name
  }

  getReleaseDate(data: Movie | Serie) {
    if (isMovie(data)) return data.release_date
    return data.first_air_date
  }

  redirect(id: number) {
    console.log('redirecting')
    this.router.navigate(['/details/', isMovie(this.media()) ? 'movie' : 'serie', id])
    document.scrollingElement?.scrollTo({ top: 0, behavior: 'smooth' })
    this.carousel()?.carouselService.navigation.resetPosition()
  }

}
