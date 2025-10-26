import { Component, ChangeDetectionStrategy, inject, viewChild, signal,  WritableSignal, DestroyRef} from '@angular/core';
import { CarouselComponent } from '../shared/components/carousel-movies/carousel-movies.component';
import { ApiService } from '../core/services/API/api.service';
import PlayTrailerComponent from '../shared/components/play-trailer/play-trailer.component';
import { CarouselSeriesComponent } from '../shared/components/carousel-series/carousel-series.component';
import { CarouselSkeletonComponent } from '../shared/components/carousel-movies/carousel-skeleton/carousel-skeleton.component';
import { fade } from '../shared/animations/animations';
import { CarouselSeriesSkeletonComponent } from '../shared/components/carousel-series/carousel-series-skeleton/carousel-series-skeleton.component';
import { BannerSkeletonComponent } from '../shared/components/banner-movie/banner-skeleton/banner-skeleton.component';
import BannerMovieComponent from '../shared/components/banner-movie/banner-movie.component';
import { BannerSeriesComponent } from '../shared/components/banner-series/banner-series.component';
import { SkeletonComponent } from '../shared/components/banner-series/skeleton/skeleton.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { PlayerTrailer } from '../core/interfaces/shared/player.interface';
import { MovieList } from '../core/interfaces/movie/movie.interface';
import { SerieList } from '../core/interfaces/serie/serie.interface';
import { Observable } from 'rxjs';

interface Loader<T> {
  call: () => Observable<T>;
  signal: WritableSignal<T | undefined>;
}
@Component({
  selector: 'app-inicio',
  imports: [BannerMovieComponent, CarouselComponent, PlayTrailerComponent, BannerSeriesComponent, SkeletonComponent,
    CarouselSeriesComponent, CarouselSkeletonComponent, BannerSkeletonComponent, 
    CarouselSeriesSkeletonComponent,BackgroundNavScrollDirective],
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
  player: PlayerTrailer = { videoId: signal(''), isPlaying: false }

  constructor() {
    this.loadMoviesAndSeries()
  }

  private loadMoviesAndSeries() {
       const movieLoaders: Loader<MovieList>[] = [
      { call: () => this.api.getNowPlaying(1), signal: this.nowPlaying },
      { call: () => this.api.getPopular(1), signal: this.popularMovies },
      { call: () => this.api.getUpcoming(1), signal: this.upcomingMovies },
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

  playTrailer(player: PlayerTrailer) {
    this.player = player
    if (player.isPlaying)
      this.playTrailerComponent()?.openTrailer()
  }
}
