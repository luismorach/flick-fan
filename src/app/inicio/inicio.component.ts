import { Component, ChangeDetectionStrategy, inject, signal,  WritableSignal} from '@angular/core';
import { ApiService } from '../core/services/API/api.service';
import { CarouselSeriesComponent } from '../shared/components/carousel/carousel-series/carousel-series.component';
import { fade } from '../shared/animations/animations';
import BannerMoviesComponent from '../shared/components/banners/banner-movies/banner-movies.component';
import { BannerSeriesComponent } from '../shared/components/banners/banner-series/banner-series.component';
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
  imports: [BannerMoviesComponent, CarouselMoviesComponent, BannerSeriesComponent,
    CarouselSeriesComponent, BackgroundNavScrollDirective],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade]
})
export default class InicioComponent {

  api = inject(ApiService)

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
      { call: () => this.api.getOnTheAirSeries(params), signal: this.onTheAir },
      { call: () => this.api.getAiringTodaySeries(params), signal: this.airingToday },
      { call: () => this.api.getPopularSeries(params), signal: this.popularSeries },
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
