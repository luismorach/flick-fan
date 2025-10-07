import { Component, effect, inject, signal, ViewChild, WritableSignal } from '@angular/core';
import { fade } from '../shared/animations/animations';
import { CommonModule, DOCUMENT } from '@angular/common';
import PlayTrailerComponent from '../shared/components/play-trailer/play-trailer.component';
import { ApiService } from '../core/services/API/api.service';
import { CarouselSkeletonComponent } from '../shared/components/carousel/carousel-skeleton/carousel-skeleton.component';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CardMovieSkeletonComponent } from '../shared/components/carousel/card-movie-skeleton/card-movie-skeleton.component';
import { CardMovieComponent } from '../shared/components/carousel/card-movie/card-movie.component';
import BannerMovieComponent from '../shared/components/banner-movie/banner-movie.component';
import { BannerSkeletonComponent } from '../shared/components/banner-movie/banner-skeleton/banner-skeleton.component';
import { ComunicatorService } from '../core/services/comunicator/comunicator.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { hasNextPage, scrollToTop } from '../shared/utils/helpers';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { PlayerTrailer } from '../core/interfaces/shared/player.interface';
import { MovieList } from '../core/interfaces/movie/movie.interface';
import { SkeletonSlidesHook, useSkeletonSlides } from '../shared/utils/use-skeleton-slides';

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
  api = inject(ApiService)
  @ViewChild(PlayTrailerComponent) playTrailerComponent !: PlayTrailerComponent
  upcomingMovies: WritableSignal<MovieList | undefined> = signal(undefined)
  nowPlaying: WritableSignal<MovieList | undefined> = signal(undefined)
  player: PlayerTrailer = { videoId: signal(''), isPlaying: false }
  doc = inject(DOCUMENT)
  isLoading: WritableSignal<boolean> = signal(false)
  slides: SkeletonSlidesHook = useSkeletonSlides(320,12);

  constructor(public comunicatorService: ComunicatorService) {
    this.comunicatorService.setBackgroundNav(false)
    scrollToTop()
    this.api.getNowPlaying(1).pipe(takeUntilDestroyed()).subscribe(data => this.nowPlaying.set(data))
    this.api.getUpcoming(1).pipe(takeUntilDestroyed()).subscribe(data => this.upcomingMovies.set(data))

    effect(() => {
      if (this.nowPlaying() !== undefined) {
        this.isLoading.set(false);
      }
    });
  }

  loadMoreOnScroll() {
    const canFetchNext = hasNextPage(this.nowPlaying());

    if (!canFetchNext || this.isLoading()) return;

    this.isLoading.set(true);
    this.api.getMoreData(this.api.getNowPlaying.bind(this.api), this.nowPlaying)
  }

  playTrailer(player: PlayerTrailer) {
    this.player = player
    if (player.isPlaying)
      this.playTrailerComponent?.openTrailer()
  }
}
