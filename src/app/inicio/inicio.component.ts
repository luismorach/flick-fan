import { Component, ChangeDetectionStrategy, inject, viewChild, signal,  WritableSignal} from '@angular/core';
import { CarouselComponent } from '../shared/components/carousel/carousel.component';
import { ApiService } from '../core/services/API/api.service';
import PlayTrailerComponent from '../shared/components/play-trailer/play-trailer.component';
import { CarouselSeriesComponent } from '../shared/components/carousel-series/carousel-series.component';
import { CarouselSkeletonComponent } from '../shared/components/carousel/carousel-skeleton/carousel-skeleton.component';
import { fade } from '../shared/animations/animations';
import { CarouselSeriesSkeletonComponent } from '../shared/components/carousel-series/carousel-series-skeleton/carousel-series-skeleton.component';
import { BannerSkeletonComponent } from '../shared/components/banner-movie/banner-skeleton/banner-skeleton.component';
import BannerMovieComponent from '../shared/components/banner-movie/banner-movie.component';
import { BannerSeriesComponent } from '../shared/components/banner-series/banner-series.component';
import { SkeletonComponent } from '../shared/components/banner-series/skeleton/skeleton.component';
import { ComunicatorService } from '../core/services/comunicator/comunicator.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { scrollToTop } from '../shared/utils/helpers';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { PlayerTrailer } from '../core/interfaces/shared/player.interface';
import { MovieList } from '../core/interfaces/movie/movie.interface';
import { SerieList } from '../core/interfaces/serie/serie.interface';

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

  constructor(public comunicatorService: ComunicatorService) {
    scrollToTop()
    this.comunicatorService.setBackgroundNav(false)
    this.loadMoviesAndSeries()
  }

  private loadMoviesAndSeries() {
    const loaders = [
      { call: () => this.api.getNowPlaying(1), signal: this.nowPlaying },
      { call: () => this.api.getPopular(1), signal: this.popularMovies },
      { call: () => this.api.getUpcoming(1), signal: this.upcomingMovies },
      { call: () => this.api.getOnTheAirSeries(1), signal: this.onTheAir },
      { call: () => this.api.getAiringTodaySeries(1), signal: this.airingToday },
      { call: () => this.api.getPopularSeries(1), signal: this.popularSeries },
    ];

    loaders.forEach(({ call, signal }) => {
      call().pipe(takeUntilDestroyed()).subscribe(data => signal.set(data));
    });
  }

  playTrailer(player: PlayerTrailer) {
    this.player = player
    if (player.isPlaying)
      this.playTrailerComponent()?.openTrailer()
  }
}
