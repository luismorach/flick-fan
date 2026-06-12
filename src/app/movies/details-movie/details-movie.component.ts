import { Component, computed, ElementRef, inject, Signal, viewChild, viewChildren } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, switchMap, } from 'rxjs/operators';
import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { MinutesToTimePipe } from '../../shared/pipes/minutes-to-time/minutes-to-time.pipe';
import { ApiService } from '../../core/services/API/api.service';
import { Crew } from '../../core/interfaces/people/credits.interface';
import { Movie, MovieList } from '../../core/interfaces/movie/movie.interface';
import { IconComponent } from "../../shared/icon/icon.component";
import { CdkScrollable } from "@angular/cdk/scrolling";
import { CarouselOptions } from '../../core/interfaces/shared/carousel-interface';
import { CarouselService } from '../../core/services/carousel/carousel-service';
import { useDataLoader } from '../../shared/utils/data-loaders/use-data-loader';
import { CarouselNavigationComponent } from "../../shared/components/carousel/carousel-navigation/carousel-navigation.component";
import { BackgroundNavScrollDirective } from "../../core/directives/background-nav-scroll.directive";
import { getHeightContainer, getReleaseDate } from '../../shared/utils/helpers';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { hasInfiniteScroll, withInfiniteScroll } from '../../shared/utils/data-loaders/enhancers/with-infinite-scroll';

@Component({
  selector: 'app-details-movie',
  imports: [DatePipe, NgOptimizedImage, DecimalPipe, MinutesToTimePipe,
    IconComponent, CdkScrollable, CarouselNavigationComponent, BackgroundNavScrollDirective,RouterLink],
  providers: [CarouselService],
  templateUrl: './details-movie.component.html',
  styleUrl: './details-movie.component.css',
})
export default class DetailsMovieComponent {

  private activeRoute = inject(ActivatedRoute)
  private router = inject(Router)
  private api = inject(ApiService)

  private id_movie = toSignal(
    this.activeRoute.params.pipe(
      map(params => params['id_movie'])),
    { initialValue: undefined }
  );

  movie = toSignal(
    toObservable(this.id_movie).pipe(
      switchMap(id => this.api.getDetails<Movie>({ dataId: id, type: 'movies' }))),
    { initialValue: undefined }
  );

  credits = toSignal(
    toObservable(this.id_movie).pipe(
      switchMap(id => this.api.getCreditsMovie({ dataId: id }))
    ),
    { initialValue: undefined }
  );

  recomended: Signal<MovieList | undefined> = toSignal(
    toObservable(this.id_movie).pipe(
      switchMap(id => this.api.getRecomendedMovies({ dataId: id }))
    ),
    { initialValue: undefined }
  );

  readonly similarMoviesLoader = useDataLoader<MovieList, 'results'>('results', this.recomended,{ dataId: this.id_movie() })
  .with(withInfiniteScroll)
  .build();
  

  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carouselSimilarMovies')
  private readonly sinopsysContainer = viewChild<ElementRef<HTMLElement>>('sinopsysContainer')
  private readonly sentinels = viewChildren<ElementRef<HTMLElement>>('sentinels')
  readonly carouselService = inject(CarouselService<MovieList, 'results'>);

  director = computed(() => {
    return this.credits()?.crew.find((person: Crew) => person.job === 'Director')
  })
  producer = computed(() => {
    return this.credits()?.crew.find((person: Crew) => person.job === 'Producer')
  })
  production = computed(() => {
    return this.movie()?.production_companies[0]
  })
  height = getHeightContainer(this.sinopsysContainer)

  readonly carouselOptions: CarouselOptions = {
    requiresEnrichment: false,
    orientation: 'horizontal',
    requireSnapMandatory: true,
    slidesConfig: {
      slidesPerView: 1,
      peek: 24,
      peekSkeletonOffset: 0,
      spaceBetween: 24,
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
    if (hasInfiniteScroll(this.similarMoviesLoader)) {
      this.similarMoviesLoader.setupInfiniteScroll(this.sentinels, this.carouselContainer)
    }
    this.carouselService.initialize(this.carouselContainer, this.carouselOptions, this.similarMoviesLoader)
  }

  getReleaseDate() {
    return getReleaseDate(this.movie())
  }

  redirect(id: number) {
    this.router.navigate(['/details-movie/', id])
  }

}
