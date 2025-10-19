import { Component, effect, inject, signal, viewChild, WritableSignal } from '@angular/core';
import { fade } from '../shared/animations/animations';
import { CommonModule } from '@angular/common';
import PlayTrailerComponent from '../shared/components/play-trailer/play-trailer.component';
import { ApiService } from '../core/services/API/api.service';
import { CarouselSkeletonComponent } from '../shared/components/carousel/carousel-skeleton/carousel-skeleton.component';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CardMovieSkeletonComponent } from '../shared/components/carousel/card-movie-skeleton/card-movie-skeleton.component';
import { CardMovieComponent } from '../shared/components/carousel/card-movie/card-movie.component';
import BannerMovieComponent from '../shared/components/banner-movie/banner-movie.component';
import { BannerSkeletonComponent } from '../shared/components/banner-movie/banner-skeleton/banner-skeleton.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { scrollToTop } from '../shared/utils/helpers';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { PlayerTrailer } from '../core/interfaces/shared/player.interface';
import { MovieList } from '../core/interfaces/movie/movie.interface';
import { SkeletonSlidesHook, useSkeletonSlides } from '../shared/utils/use-skeleton-slides';
import { forkJoin } from 'rxjs';
import { DataLoaderManager } from '../shared/utils/data-loader-manager';

@Component({
  selector: 'app-movies',
  imports: [BannerMovieComponent,
    BannerSkeletonComponent,
    PlayTrailerComponent,
    CarouselSkeletonComponent,
    CardMovieSkeletonComponent,
    CardMovieComponent,
    CommonModule,
    InfiniteScrollDirective,
    BackgroundNavScrollDirective
  ],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css',
  animations: [fade]
})
export default class MoviesComponent {

  private readonly playTrailerComponent = viewChild<PlayTrailerComponent>(PlayTrailerComponent);
  readonly dataLoaderManager: DataLoaderManager = inject(DataLoaderManager)
  private readonly api = inject(ApiService);
  readonly upcomingMovies: WritableSignal<MovieList | undefined> = signal(undefined)
  readonly nowPlaying: WritableSignal<MovieList | undefined> = signal(undefined)
  readonly slides: SkeletonSlidesHook = useSkeletonSlides(320);
  player: PlayerTrailer = { videoId: signal(''), isPlaying: false }
  
  moreDataEffect = effect(() => {
    if (this.nowPlaying() !== undefined) {
      this.dataLoaderManager.completeFetch()
    }
  });

  constructor() {
    scrollToTop()
    this.loadInitialData()
  }

  private loadInitialData(): void {
    forkJoin({
      nowPlaying: this.api.getNowPlaying(1),
      upcoming: this.api.getUpcoming(1)
    }).pipe(
      takeUntilDestroyed(),
    ).subscribe(({ nowPlaying, upcoming }) => {
      this.nowPlaying.set(nowPlaying);
      this.upcomingMovies.set(upcoming);
    });
  }

  playTrailer(player: PlayerTrailer): void {
    this.player = player
    if (player.isPlaying && this.playTrailerComponent())
      this.playTrailerComponent()?.openTrailer()
  }
}
