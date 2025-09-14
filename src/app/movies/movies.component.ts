import { Component, inject, signal, ViewChild,  WritableSignal } from '@angular/core';
import { fade } from '../shared/animations/animations';
import { CommonModule, DOCUMENT } from '@angular/common';
import PlayTrailerComponent from '../shared/components/play-trailer/play-trailer.component';
import { listMovies, playerTrailer } from '../core/interfaces/interfaces';
import { ApiService } from '../core/services/API/api.service';
import { CarouselSkeletonComponent } from '../shared/components/carousel/carousel-skeleton/carousel-skeleton.component';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CardMovieSkeletonComponent } from '../shared/components/carousel/card-movie-skeleton/card-movie-skeleton.component';
import { CardMovieComponent } from '../shared/components/carousel/card-movie/card-movie.component';
import BannerComponent from '../shared/components/banner/banner.component';
import { BannerSkeletonComponent } from '../shared/components/banner/banner-skeleton/banner-skeleton.component';
import { ComunicatorService } from '../core/services/comunicator/comunicator.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { calculateNumSlides, scrollToTop } from '../shared/utils/helpers';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';

@Component({
  selector: 'app-movies',
  imports: [BannerComponent,
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
  @ViewChild(PlayTrailerComponent) playTrailerComponent !:PlayTrailerComponent
  upcomingMovies: WritableSignal<listMovies | undefined> = signal(undefined)
  nowPlaying: WritableSignal<listMovies | undefined> = signal(undefined)
  player: playerTrailer = { videoId: signal(''), isPlaying: false }
  doc = inject(DOCUMENT)
  numSlides = 0
  skeletonsIndexes!: number[]
  isLoading: WritableSignal<boolean> = signal(false)

  constructor(public comunicatorService: ComunicatorService) {
    this.comunicatorService.setBackgroundNav(false)
    scrollToTop()
    this.api.getNowPlaying(1).pipe(takeUntilDestroyed()).subscribe(data => this.nowPlaying.set(data))
    this.api.getUpcoming(1).pipe(takeUntilDestroyed()).subscribe(data => this.upcomingMovies.set(data))
  }

  ngAfterViewInit() {
    this.numSlides = calculateNumSlides(this.doc.scrollingElement?.scrollWidth ?? 0, 336)
    this.skeletonsIndexes = Array.from({ length: this.numSlides }, (_, i) => i)
  }

  loadMoreOnScroll() {
    let page = this.nowPlaying()?.page ?? 0;
    let total_pages = this.nowPlaying()?.total_pages ?? 0;
    if (page >= total_pages) {
      this.isLoading.set(false)
      return
    }
    this.isLoading.set(true)
    this.api.getMoreData(this.api.getNowPlaying.bind(this.api), this.nowPlaying)
  }

  playTrailer(player: playerTrailer) {
    this.player = player
    if (player.isPlaying)
      this.playTrailerComponent?.openTrailer()
  }

}
