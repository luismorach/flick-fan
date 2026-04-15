import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, inject, Renderer2, Signal, signal, viewChild, ViewChild, viewChildren, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { concatAll, map, switchMap, tap } from 'rxjs/operators';
import { CurrencyPipe, DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
//import { SwiperOptions } from 'swiper';
import { MinutesToTimePipe } from '../../shared/pipes/minutes-to-time/minutes-to-time.pipe';
import { ApiService } from '../../core/services/API/api.service';
import { ComunicatorService } from '../../core/services/comunicator/comunicator.service';
import { Credits, Crew } from '../../core/interfaces/people/credits.interface';
import { Movie, MovieList } from '../../core/interfaces/movie/movie.interface';
import { AutoImagePipe } from '../../shared/pipes/autoimage/auto-image.pipe';
import { IconComponent } from "../../shared/icon/icon.component";
import { CdkScrollable } from "@angular/cdk/scrolling";
import { CarouselOptions } from '../../core/interfaces/shared/carousel-interface';
import { CarouselService } from '../../core/services/carousel/carousel-service';
import { useDataLoader } from '../../shared/utils/data-loaders/use-data-loader';
import { CarouselNavigationComponent } from "../../shared/components/carousel/carousel-navigation/carousel-navigation.component";
import { withPagination } from '../../shared/utils/data-loaders/enhancers/with-pagination';
import { routes } from '../../app.routes';
import { BackgroundNavScrollDirective } from "../../core/directives/background-nav-scroll.directive";
import { getHeightContainer, getReleaseDate } from '../../shared/utils/helpers';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-details-movie',
  imports: [DatePipe, NgOptimizedImage, DecimalPipe, RouterLink, MinutesToTimePipe, AutoImagePipe,
     IconComponent, CdkScrollable, CarouselNavigationComponent, BackgroundNavScrollDirective],
  providers: [CarouselService],
  templateUrl: './details-movie.component.html',
  styleUrl: './details-movie.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
      switchMap(id => this.api.getDetailsMovie({ dataId: id }))),
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

  readonly similarMoviesLoader = useDataLoader<MovieList, 'results'>('results', this.recomended, 
    { dataId: this.id_movie() }).pipe(
    withPagination
  )

  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carouselSimilarMovies')
  private readonly sinopsysContainer = viewChild<ElementRef<HTMLElement>>('sinopsysContainer')
  readonly carouselService = inject(CarouselService<Credits, 'cast'>);

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
      peek: 32,
      peekSkeletonOffset: 0,
      spaceBetween: 24,
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
    this.carouselService.initialize(this.carouselContainer, this.carouselOptions, this.similarMoviesLoader)
  }

  getReleaseDate() {
    return getReleaseDate(this.movie())
  }

  redirect(id: number) {
    this.router.navigate(['/details-movie/', id])
  }

}
