import { Component, effect, ElementRef, inject, Renderer2, signal, ViewChild, viewChild, WritableSignal } from '@angular/core';
import { fade } from '../shared/animations/animations';
import { CommonModule, DOCUMENT } from '@angular/common';
import PlayTrailerComponent from '../shared/components/play-trailer/play-trailer.component';
import { listMovies, playerTrailer } from '../shared/interfaces/interfaces';
import { ApiService } from '../shared/services/API/api.service';
import { CarouselSkeletonComponent} from '../shared/components/carousel/carousel-skeleton/carousel-skeleton.component';
import { calculateNumSlides } from '../shared/utils/helpers';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CardMovieSkeletonComponent } from '../shared/components/carousel/card-movie-skeleton/card-movie-skeleton.component';
import { CardMovieComponent } from '../shared/components/carousel/card-movie/card-movie.component';
import BannerComponent from '../shared/components/banner/banner.component';
import { BannerSkeletonComponent } from '../shared/components/banner/banner-skeleton/banner-skeleton.component';

@Component({
  selector: 'app-movies',
  imports: [BannerComponent, BannerSkeletonComponent, PlayTrailerComponent, CarouselSkeletonComponent,
    CardMovieSkeletonComponent, CardMovieComponent, CommonModule, InfiniteScrollDirective],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css',
  animations: [fade]
})
export default class MoviesComponent {
  API = inject(ApiService)
  playTrailerComponent = viewChild(PlayTrailerComponent)
  popularMovies: WritableSignal<listMovies | undefined> = signal(undefined)
  upcomingMovies: WritableSignal<listMovies | undefined> = signal(undefined)
  nowPlaying: WritableSignal<listMovies | undefined> = signal(undefined)
  player: playerTrailer = { videoId: signal(''), isPlaying: false }
  doc = inject(DOCUMENT)
  numMovies = 0
  numElements!: number[]
  isLoading: WritableSignal<boolean> = signal(false)

  constructor() {
    this.doc.scrollingElement?.scrollTo(0, 0)
    effect(() => {
      this.API.getNowPlaying(1).subscribe(data => this.nowPlaying.set(data))
    })
    effect(() => {
      this.API.getPopular(1).subscribe(data => this.popularMovies.set(data))
    })
    effect(() => {
      this.API.getUpcoming(1).subscribe(data => this.upcomingMovies.set(data))
    })
    effect(() => {
      console.log('data recargada', this.nowPlaying())
      this.isLoading.set(false)
    })


  }
  ngAfterViewInit() {
    this.numMovies = calculateNumSlides(this.doc.scrollingElement?.scrollWidth ?? 0, 336)
    this.numElements = Array.from({ length: this.numMovies }, (_, i) => i)
    console.log(this.numMovies)

  }

  onScroll() {
    let page = this.nowPlaying()?.page ?? 0;
    let total_pages = this.nowPlaying()?.total_pages ?? 0;
    if (page >= total_pages) {
      this.isLoading.set(false)
      return
    }
    this.isLoading.set(true)
    this.API.getMoreData(this.API.getNowPlaying.bind(this.API), this.nowPlaying)
  }

  playTrailer(player: playerTrailer) {
    this.player = player
    if (player.isPlaying)
      this.playTrailerComponent()?.openTrailer()
  }

}
