import { ChangeDetectionStrategy, Component, inject, signal, viewChild, WritableSignal } from '@angular/core';
import { fade } from '../shared/animations/animations';
import { CommonModule } from '@angular/common';
import PlayTrailerComponent from '../shared/components/play-trailer/play-trailer.component';
import { ApiService } from '../core/services/API/api.service';
import { CarouselSkeletonComponent } from '../shared/components/carousel-movies/carousel-skeleton/carousel-skeleton.component';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CardMovieSkeletonComponent } from '../shared/components/carousel-movies/card-movie-skeleton/card-movie-skeleton.component';
import { CardMovieComponent } from '../shared/components/carousel-movies/card-movie/card-movie.component';
import BannerMovieComponent from '../shared/components/banner-movie/banner-movie.component';
import { BannerSkeletonComponent } from '../shared/components/banner-movie/banner-skeleton/banner-skeleton.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { PlayerTrailer } from '../core/interfaces/shared/player.interface';
import { MovieList } from '../core/interfaces/movie/movie.interface';
import { SkeletonSlidesHook, useSkeletonSlides } from '../shared/utils/use-skeleton-slides';
import { forkJoin } from 'rxjs';
import { DataLoaderManager } from '../shared/utils/data-loader-manager';
import { EmptyComponent } from '../shared/components/empty/empty.component';
import { ScrollConfigService } from '../core/services/scroll-config/scroll-config.service';
import { GridHelperService } from '../core/services/grid-helper/grid-helper.service';

@Component({
  selector: 'app-movies',
  imports: [
    BannerMovieComponent,
    BannerSkeletonComponent,
    PlayTrailerComponent,
    CarouselSkeletonComponent,
    CardMovieComponent,
    CommonModule,
    InfiniteScrollDirective,
    BackgroundNavScrollDirective,
    EmptyComponent,
  ],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css',
  animations: [fade],
  host: { '[@fade]': '' },
  changeDetection: ChangeDetectionStrategy.OnPush
})

export default class MoviesComponent {
  readonly dataLoaderManager = inject(DataLoaderManager)
  private readonly api = inject(ApiService);
  readonly scrollConfig = inject(ScrollConfigService)
  readonly gridHelper = inject(GridHelperService)
  readonly upcomingMovies = signal<MovieList | undefined>(undefined)
  readonly nowPlaying = signal<MovieList | undefined>(undefined)
  readonly slides = useSkeletonSlides(320);
  player: PlayerTrailer = { videoId: signal(''), isPlaying: false }
  private readonly playTrailerComponent = viewChild<PlayTrailerComponent>(PlayTrailerComponent);

  constructor() {
    this.dataLoaderManager.setupSignalMonitoring(this.nowPlaying)
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
