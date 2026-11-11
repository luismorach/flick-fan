import { Component, ChangeDetectionStrategy, inject, signal, WritableSignal, computed, viewChild } from '@angular/core';
import { ApiService } from '../../core/services/API/api.service';
import { fade } from '../../shared/animations/animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BackgroundNavScrollDirective } from '../../core/directives/background-nav-scroll.directive';
import { MovieList } from '../../core/interfaces/movie/movie.interface';
import { Serie, SerieList } from '../../core/interfaces/serie/serie.interface';
import { Observable } from 'rxjs';
import { ParamsApi } from '../../core/interfaces/shared/params-http.interface';
import { CarouselComponent } from "../../shared/components/carousel/carousel.component";
import { useDataLoader } from '../../shared/utils/data-loaders/use-data-loader';
import { withInfiniteScroll } from '../../shared/utils/data-loaders/enhancers/with-infinite-scroll';
import { CarouselOptions } from '../../core/interfaces/shared/carousel-interface';
import { CardMovieComponent } from "../../shared/components/movies/cards/card-movie/card-movie.component";
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { CarouselMoviesSkeletonComponent } from "../../shared/components/movies/cards/carousel-skeleton/carousel-movies-skeleton.component";
import { CardSerieComponent } from "../../shared/components/series/cards/card-serie/card-serie.component";
import { CarouselSeriesSkeletonComponent } from "../../shared/components/series/cards/carousel-series-skeleton/carousel-series-skeleton.component";
import { BannerDetailComponent } from '../../shared/components/movies/banner/banner-movie-details/banner-movie-details.component';
import { WithDetails } from '../../shared/utils/data-loaders/enhancers/with-details';
import { BannerSkeletonComponent } from '../../shared/components/movies/banner/banner-skeleton/banner-skeleton.component';
import { BannerDetailsComponent } from '../../shared/components/series/banner/banner-details/banner-details.component';
import { SlideComponent } from '../../shared/components/series/banner/slide/slide.component';
import { SkeletonComponent } from '../../shared/components/series/banner/skeleton/skeleton.component';

interface Loader<T> {
  call: () => Observable<T>;
  signal: WritableSignal<T | undefined>;
}
@Component({
  selector: 'app-inicio',
  imports: [ SkeletonComponent,BackgroundNavScrollDirective, CarouselComponent, CardMovieComponent, CarouselMoviesSkeletonComponent,
    CardSerieComponent, CarouselSeriesSkeletonComponent, BannerDetailComponent, BannerSkeletonComponent, NgOptimizedImage,
     BannerDetailsComponent, SlideComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade]
})
export default class InicioComponent {

  api = inject(ApiService)

  protected popularMovies: WritableSignal<MovieList | undefined> = signal(undefined)
  protected upcomingMovies: WritableSignal<MovieList | undefined> = signal(undefined)
  protected nowPlaying: WritableSignal<MovieList | undefined> = signal(undefined)
  protected airingToday: WritableSignal<SerieList | undefined> = signal(undefined)
  protected onTheAir: WritableSignal<SerieList | undefined> = signal(undefined)
  protected popularSeries: WritableSignal<SerieList | undefined> = signal(undefined)
  activeMedia: WritableSignal<Serie | undefined> = signal(undefined)

  readonly nowPlayingLoader = useDataLoader<MovieList, 'results'>('results', this.nowPlaying)
    .with(withInfiniteScroll)
    .with(WithDetails)
    .build();
  readonly airingTodayLoader = useDataLoader<SerieList, 'results'>('results', this.airingToday)
    .with(withInfiniteScroll)
    .with(WithDetails)
    .build();

  readonly popularMoviesloader = useDataLoader<MovieList, 'results'>('results', this.popularMovies)
    .with(withInfiniteScroll)
    .build();

  readonly uncomingMoviesloader = useDataLoader<MovieList, 'results'>('results', this.upcomingMovies)
    .with(withInfiniteScroll)
    .build();

  readonly onTheAirLoader = useDataLoader<SerieList, 'results'>('results', this.onTheAir)
    .with(withInfiniteScroll)
    .with(WithDetails)
    .build()

  readonly popularSeriesLoader = useDataLoader<SerieList, 'results'>('results', this.popularSeries)
    .with(withInfiniteScroll)
    .build()

   readonly bannerSeriesOptions: CarouselOptions = {
    requiresEnrichment: true,
    requireAnimation:true,
    slidesPerGroup: 1,
    orientation: 'vertical',
    slidesConfig: {
      containerOrientation: 'horizontal',
      skeletonCount: 1,
      slidesPerView: 5,
      centeredSlides: true,
      aspectRatio: 9 / 16,
      maxScale: 2,
      breakpoints: {
        768: {
          containerOrientation: 'vertical',
          skeletonCount: 1,
          slidesPerView: 5,
          centeredSlides: true,
          aspectRatio: 16 / 9,
          maxScale: 2
        }
      }
    }
  }

  readonly bannerMoviesOptions: CarouselOptions = {
    requiresEnrichment: true,
    slidesPerGroup: 1,
    orientation: 'horizontal',
    slidesConfig: {}
  }

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
      expandedSlideMultiplier: 2.6,
      breakpoints: {
        398: { slidesPerView: 1.5 },
        508: { slidesPerView: 2, },
        748: { slidesPerView: 3, peek: 32 },
        988: { slidesPerView: 4, peek: 44 },
        1388: { slidesPerView: 5 }
      }
    }
  }

  constructor() {
    this.loadMoviesAndSeries()
  }

  private loadMoviesAndSeries() {
    const params: ParamsApi = { page: 1 }
    const movieLoaders: Loader<MovieList>[] = [
      { call: () => this.api.getNowPlaying(params), signal: this.nowPlaying },
      { call: () => this.api.getPopular(params), signal: this.popularMovies },
      { call: () => this.api.getUpcoming(params), signal: this.upcomingMovies },
    ];

    const serieLoaders: Loader<SerieList>[] = [
      { call: () => this.api.getOnTheAirSeries(params), signal: this.onTheAir },
      { call: () => this.api.getAiringTodaySeries(params), signal: this.airingToday },
      { call: () => this.api.getPopularSeries(params), signal: this.popularSeries },
    ];

    // Cargar películas
    movieLoaders.forEach(({ call, signal }) => {
      call().pipe(takeUntilDestroyed()).subscribe((data: MovieList) => signal.set(data));
    });

    // Cargar series
    serieLoaders.forEach(({ call, signal }) => {
      call().pipe(takeUntilDestroyed()).subscribe((data: SerieList) => signal.set(data));
    });

  }

  onActiveMedia(media: Serie) {
    this.activeMedia.set(media)
  }
}
