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

@Component({
  selector: 'app-inicio',
  imports: [BannerComponent, carouselComponent,
    PlayTrailerComponent, BannerSeriesComponent, CarouselSeriesComponent, CarouselSkeletonComponent
  ],
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
  nowPlaying = toSignal(this.API.getNowPlaying(1) as Observable<listMovies>,)
  airingToday = toSignal(this.API.getAiringTodaySeries() as Observable<listSeries>)
  player: playerTrailer = { videoId: signal(''), isPlaying: false }

  constructor() {
    effect(() => {
      this.API.getPopular(1).subscribe(data => this.popularMovies.set(data))
    })
    effect(() => {
      this.API.getUpcoming(1).subscribe(data => this.upcomingMovies.set(data))
    })
  }

  playTrailer(player: playerTrailer) {
    this.player = player
    if (player.isPlaying)
      this.playTrailerComponent()?.openTrailer()
  }

  getMoreData(MethodApi: Function, currentData: WritableSignal<listMovies | listSeries | undefined>) {
    console.log('solicitando mas datos')
    let currentPage = currentData()?.page
    if (currentPage) currentPage += 1
    console.log('numero de pagina', currentPage)

    MethodApi(currentPage).subscribe((newData: any) => {
      currentData.update((data: any) => ({
        ...data,
        page: newData.page,
        results: [...data?.results, ...newData.results]
      }))
    })
  }
}
