import { Component, effect, ElementRef, inject, Renderer2, signal, ViewChild, viewChild, WritableSignal } from '@angular/core';
import BannerComponent from '../inicio/components/banner/banner.component';
import { BannerSkeletonComponent } from '../inicio/components/banner/banner-skeleton/banner-skeleton.component';
import { fade } from '../shared/animations/animations';
import { CommonModule, DOCUMENT } from '@angular/common';
import PlayTrailerComponent from '../shared/components/play-trailer/play-trailer.component';
import { listMovies, playerTrailer } from '../shared/interfaces/interfaces';
import { ApiService } from '../shared/services/API/api.service';
import { CarouselSkeletonComponent } from '../shared/components/carousel/carousel-skeleton/carousel-skeleton.component';
import { calculateNumSlides} from '../shared/utils/carousel';
import { MovieCarouselComponent } from '../shared/components/carousel/movie-carousel/movie-carousel.component';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { SlideSkeletonComponent } from '../shared/components/carousel/carousel-skeleton/slide-skeleton/slide-skeleton.component';

@Component({
  selector: 'app-movies',
  imports: [BannerComponent, BannerSkeletonComponent, PlayTrailerComponent, CarouselSkeletonComponent,
    SlideSkeletonComponent, MovieCarouselComponent, CommonModule,InfiniteScrollDirective],
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
  numElements!:number[]
  isLoading:WritableSignal<boolean> =signal(false)

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
      console.log('data recargada',this.nowPlaying())
      this.isLoading.set(false)
    })
   

  }
  ngAfterViewInit() {
    this.numMovies = calculateNumSlides(this.doc.scrollingElement?.scrollWidth ?? 0, 336)
    this.numElements = Array.from({ length: this.numMovies }, (_, i) => i)
    console.log(this.numMovies)

  }

  onScroll(){
    this.isLoading.set(true)
    console.log('pidiendo mas datos')
    this.API.getMoreData(this.API.getNowPlaying.bind(this.API),this.nowPlaying)
  }

  playTrailer(player: playerTrailer) {
    this.player = player
    if (player.isPlaying)
      this.playTrailerComponent()?.openTrailer()
  }

}
