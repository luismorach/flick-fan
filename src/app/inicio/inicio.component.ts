import { Component, ChangeDetectionStrategy, inject, viewChild, HostListener, signal, Signal, runInInjectionContext, EnvironmentInjector, effect, WritableSignal } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import BannerComponent from './components/banner/banner.component';
import { carouselComponent } from '../shared/components/carousel/carousel.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { listMovies, listSeries, playerTrailer } from '../shared/interfaces/interfaces';
import { ApiService } from '../shared/services/API/api.service';
import PlayTrailerComponent from '../shared/components/play-trailer/play-trailer.component';
import { BannerSeriesComponent } from './components/banner-series/banner-series.component';
import { CarouselSeriesComponent } from '../shared/components/carousel-series/carousel-series.component';
import { CarouselSkeletonComponent } from '../shared/components/carousel/carousel-skeleton/carousel-skeleton.component';
import { fade } from '../shared/animations/animations';
import { BannerSkeletonComponent } from './components/banner/banner-skeleton/banner-skeleton.component';
import { LoadingComponent } from './components/loading/loading.component';
import { CarouselSeriesSkeletonComponent } from '../shared/components/carousel-series/carousel-series-skeleton/carousel-series-skeleton.component';
import { DOCUMENT } from '@angular/common';
import { SlideSkeletonComponent } from '../shared/components/carousel/carousel-skeleton/slide-skeleton/slide-skeleton.component';
import { SkeletonComponent } from './components/banner-series/skeleton/skeleton.component';

@Component({
  selector: 'app-inicio',
  imports: [BannerComponent, carouselComponent, PlayTrailerComponent, BannerSeriesComponent, SkeletonComponent,
    CarouselSeriesComponent, CarouselSkeletonComponent,BannerSkeletonComponent,LoadingComponent,CarouselSeriesSkeletonComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade]
})
export default class InicioComponent {

  API = inject(ApiService)
  playTrailerComponent = viewChild(PlayTrailerComponent)
  popularMovies: WritableSignal<listMovies | undefined> = signal(undefined)
  upcomingMovies: WritableSignal<listMovies | undefined> = signal(undefined)
  nowPlaying : WritableSignal<listMovies | undefined> = signal(undefined)
  airingToday : WritableSignal<listSeries | undefined> = signal(undefined)
  onTheAir:WritableSignal<listSeries | undefined> = signal(undefined)
  popularSeries:WritableSignal<listSeries | undefined> = signal(undefined)
  player: playerTrailer = { videoId: signal(''), isPlaying: false }
  doc = inject(DOCUMENT)

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
      this.API.getOnTheAirSeries(1).subscribe(data => this.onTheAir.set(data))
    })
    effect(() => {
      this.API.getAiringTodaySeries(1).subscribe(data => this.airingToday.set(data))
    })
    effect(() => {
      this.API.getPopularSeries(1).subscribe(data => this.popularSeries.set(data))
    })
  }

  playTrailer(player: playerTrailer) {
    this.player = player
    if (player.isPlaying)
      this.playTrailerComponent()?.openTrailer()
  }
}
