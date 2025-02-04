import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, Signal, signal, WritableSignal, Inject, ChangeDetectionStrategy, viewChild, computed, effect, Injector, runInInjectionContext, Renderer2 } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop'
import { DOCUMENT, DatePipe, NgOptimizedImage } from '@angular/common';
import { register } from 'swiper/element/bundle'
import { SwiperOptions } from 'swiper/types';
import 'swiper/css'
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { AllMovies, Movie } from '../../../shared/interfaces/interfaces';
import { RouterLink } from '@angular/router';
import PlayTrilerComponent from '../../../shared/components/play-triler/play-triler.component';
import { AnimationsService } from '../../../shared/services/animations.service';
register()

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [DatePipe, NgOptimizedImage, RouterLink, PlayTrilerComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class BannerComponent {
  api = inject(ApiService)
  animations= inject(AnimationsService)

  playThrilerComponent = viewChild(PlayTrilerComponent)
  allMovies: Signal<AllMovies | undefined> = toSignal<AllMovies>(this.api.getNowPlaying() as Observable<AllMovies>)
  movie: WritableSignal<Movie | undefined> = signal<Movie | undefined>(this.allMovies()?.results[0])
  detailsMovie:Signal<any> =signal(undefined)
  showTrailer : WritableSignal<boolean> =signal(false)

  constructor(@Inject(DOCUMENT) private document: Document, private injector:Injector) {
    this.initSwiper()
    this.initDetailsMovie()
    
  }

  initSwiper() {
    const swiperElementContructor = this.document.querySelector('swiper-container')
    const swiperOptions: SwiperOptions = {
      speed: 800,
      slidesPerView: 1,
      allowTouchMove: false,
      navigation: {
        enabled: true,
        nextEl: '.swiper-next',
        prevEl: '.swiper-previous'
      },
    }

    swiperElementContructor?.addEventListener('swiperslidechange', (event: any) => {
      console.log(event.detail[0].activeIndex)
      const index: number = event.detail[0].activeIndex
      this.movie.set(this.allMovies()?.results[index])
    })
    if (swiperElementContructor) {
      Object.assign(swiperElementContructor, swiperOptions)
      swiperElementContructor?.initialize()
    }

  }

  initDetailsMovie(){
    let id_movie = this.movie()?.id
    if (id_movie) {
      this.detailsMovie = toSignal<any>(this.api.getDetailsMovie(id_movie) as Observable<any>)
      console.log(this.detailsMovie())
    } 
  }
  animateElements () {
    const title = this.document.getElementById('title')
    const rating = this.document.getElementById('rating')
    const overview = this.document.getElementById('overview')
    const genres = this.document.getElementById('genres')
    const release = this.document.getElementById('release')
    const buttons = this.document.getElementById('buttons')

    let playerTitle = this.animations.moveX('400ms', '700ms', '-150%','0').create(title)
    playerTitle.play()

    let playerRating = this.animations.moveX('400ms', '700ms', '-150%','0').create(rating)
    playerRating.play()

    let playerOverview = this.animations.moveY('400ms', '500ms', '100%','0').create(overview)
    playerOverview.play()

    let playerGenres = this.animations.moveY('400ms', '1s', '50%','0').create(genres)
    playerGenres.play()

    let playerRelease = this.animations.moveY('400ms', '1s', '50%','0').create(release)
    playerRelease.play()

    let playerButtons = this.animations.moveY('200ms', '1.3s', '3%','0').create(buttons)
    playerButtons.play()

    runInInjectionContext(this.injector,(()=>{
      this.initDetailsMovie()
      
    }))
   
  }
 
  render() {
    console.log('renderizo')
  }
  load() {
    console.log('ya cargo')
  }
  playTrailer() {
    this.playThrilerComponent()?.minimized.set(false)
    this.playThrilerComponent()?.maximize()
    this.showTrailer.set(true)
  }
  
}






