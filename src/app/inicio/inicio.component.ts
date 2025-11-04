import { Component, ChangeDetectionStrategy, inject, viewChild, signal,  WritableSignal} from '@angular/core';
import { ApiService } from '../core/services/API/api.service';
import PlayTrailerComponent from '../shared/components/play-trailer/play-trailer.component';
import { CarouselSeriesComponent } from '../shared/components/carousel/carousel-series/carousel-series.component';
import { fade } from '../shared/animations/animations';
import { BannerSkeletonComponent } from '../shared/components/banner-movie/banner-skeleton/banner-skeleton.component';
import BannerMovieComponent from '../shared/components/banner-movie/banner-movie.component';
import { BannerSeriesComponent } from '../shared/components/banner-series/banner-series.component';
import { SkeletonComponent } from '../shared/components/banner-series/skeleton/skeleton.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { MovieList } from '../core/interfaces/movie/movie.interface';
import { SerieList } from '../core/interfaces/serie/serie.interface';
import { Observable } from 'rxjs';
import { CarouselMoviesComponent } from '../shared/components/carousel/carousel-movies/carousel-movies.component';
import { ParamsApi } from '../core/interfaces/shared/params-http.interface';

interface Loader<T> {
  call: () => Observable<T>;
  signal: WritableSignal<T | undefined>;
}
@Component({
  selector: 'app-inicio',
  imports: [BannerMovieComponent, CarouselMoviesComponent, BannerSeriesComponent, SkeletonComponent,
    CarouselSeriesComponent,  BannerSkeletonComponent,BackgroundNavScrollDirective],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade]
})
export default class InicioComponent {

  api = inject(ApiService)

  playTrailerComponent = viewChild(PlayTrailerComponent)
  popularMovies: WritableSignal<MovieList | undefined> = signal(undefined)
  upcomingMovies: WritableSignal<MovieList | undefined> = signal(undefined)
  nowPlaying: WritableSignal<MovieList | undefined> = signal(undefined)
  airingToday: WritableSignal<SerieList | undefined> = signal(undefined)
  onTheAir: WritableSignal<SerieList | undefined> = signal(undefined)
  popularSeries: WritableSignal<SerieList | undefined> = signal(undefined)

  constructor() {
    this.loadMoviesAndSeries()
  }

  private loadMoviesAndSeries() {
      const params:ParamsApi={page:1}
      const movieLoaders: Loader<MovieList>[] = [
      { call: () => this.api.getNowPlaying(params), signal: this.nowPlaying },
      { call: () => this.api.getPopular(params), signal: this.popularMovies },
      { call: () => this.api.getUpcoming(params), signal: this.upcomingMovies },
    ];

    const serieLoaders: Loader<SerieList>[] = [
      { call: () => this.api.getOnTheAirSeries(1), signal: this.onTheAir },
      { call: () => this.api.getAiringTodaySeries(1), signal: this.airingToday },
      { call: () => this.api.getPopularSeries(1), signal: this.popularSeries },
    ];

    // Cargar películas
    movieLoaders.forEach(({ call, signal }) => {
      call().pipe(takeUntilDestroyed()).subscribe((data:MovieList) => signal.set(data));
    });

    // Cargar series
    serieLoaders.forEach(({ call, signal }) => {
      call().pipe(takeUntilDestroyed()).subscribe((data:SerieList) => signal.set(data));
    });

  }
}
