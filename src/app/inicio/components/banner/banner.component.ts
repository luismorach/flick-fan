import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, Signal, signal, WritableSignal, Inject, ChangeDetectionStrategy, viewChild, computed, effect, Injector, runInInjectionContext, Renderer2, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop'
import { DOCUMENT, DatePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { register, SwiperContainer } from 'swiper/element/bundle'
import { SwiperOptions } from 'swiper/types';
import 'swiper/css'
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/API/api.service';
import { AllMovies, Movie } from '../../../shared/interfaces/interfaces';
import { RouterLink } from '@angular/router';
import PlayTrailerComponent from '../../../shared/components/play-triler/play-triler.component';
import { AnimationsService } from '../../../shared/services/animations/animations.service';
import { RatingComponent } from '../../../shared/components/rating/rating.component';
import { ComunicatorService } from '../../../shared/services/comunicator/comunicator.service';
register()

@Component({
  selector: 'app-banner',
  imports: [DatePipe, NgOptimizedImage, RouterLink, PlayTrailerComponent, NgClass, RatingComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None

})

export default class BannerComponent {

  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>
  api = inject(ApiService)
  animationsService = inject(AnimationsService)
  indexCurrentElement: number = 0
  allElements: number = 0
  

  playTrailerComponent = viewChild(PlayTrailerComponent)
  allMovies: Signal<AllMovies | undefined> = toSignal(this.api.getNowPlaying() as Observable<AllMovies>)
  id_movie: WritableSignal<any> = signal(this.allMovies()?.results[0].id)
  movie: WritableSignal<any> = signal(undefined)
  showTrailer: WritableSignal<boolean> = signal(false)

  constructor(@Inject(DOCUMENT) private document: Document,public comunicatorService:ComunicatorService) {

    this.comunicatorService.setBackgroundNav(false)
    effect(() => {
      let results = this.allMovies()?.results.length
      this.id_movie.set(this.allMovies()?.results[0].id)
      if (results)
        this.allElements = results
    })
    effect(() => {
      let id_movie = this.id_movie()
      if (id_movie)
        this.api.getDetailsMovie(id_movie).subscribe((data) => { this.movie.set(data);console.log(data) })
    })
    effect(() => {
      this.animateElements()
    })
  }
  
  ngAfterViewInit() {
    this.initSwiper()
  }
  
  initSwiper() {
    const swiperOptions: SwiperOptions = {
      speed: 800,
      slidesPerView: 1,
      allowTouchMove: false,
      pagination: {
        enabled: true,
        dynamicBullets: true
      },
      navigation: {
        enabled: true,
        nextEl: '.swiper-next',
        prevEl: '.swiper-previous'
      },
    }
    this.swiperContainer.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      console.log(event.detail[0].activeIndex)
      this.indexCurrentElement = event.detail[0].activeIndex
      this.id_movie.set(this.allMovies()?.results[this.indexCurrentElement].id)
    })
    if (this.swiperContainer) {
      Object.assign(this.swiperContainer.nativeElement, swiperOptions)
      this.swiperContainer.nativeElement?.initialize()
    }

  }


  animateElements() {
    const title = this.document.getElementById('title')
    const rating = this.document.getElementById('rating')
    const overview = this.document.getElementById('overview')
    const genres = this.document.getElementById('genres')
    const release = this.document.getElementById('release')
    const buttons = this.document.getElementById('buttons')

    let playerTitle = this.animationsService.moveX('400ms', '700ms', '-150%', '0').create(title)
    playerTitle.play()

    let playerRating = this.animationsService.moveX('400ms', '700ms', '-150%', '0').create(rating)
    playerRating.play()

    let playerOverview = this.animationsService.moveY('400ms', '500ms', '100%', '0').create(overview)
    playerOverview.play()

    let playerGenres = this.animationsService.moveY('400ms', '1s', '50%', '0').create(genres)
    playerGenres.play()

    let playerRelease = this.animationsService.moveY('400ms', '1s', '50%', '0').create(release)
    playerRelease.play()

    let playerButtons = this.animationsService.moveY('200ms', '1.3s', '3%', '0').create(buttons)
    playerButtons.play() 

    /* runInInjectionContext(this.injector, (() => {
      this.initDetailsMovie()

    })) */

  }

  render() {
    console.log('renderizo')
  }
  load() {
    console.log('ya cargo')
  }
  playTrailer() {
    this.playTrailerComponent()?.openTrailer()
    
    this.showTrailer.set(true)
  }

  getKeyTrailer() {
    let key
    this.movie()?.videos?.results.forEach((element: any) => {
      if (element.type === 'Trailer') {
        key = element.key
        return key
      }
    });
    console.log(key)
    return key
  }
  
  ngOnDestroy() {
    
    console.log('destruido')
  }

}






