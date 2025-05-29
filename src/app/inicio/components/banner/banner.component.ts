import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, Signal, signal, WritableSignal, Inject, ChangeDetectionStrategy, viewChild, computed, effect, Injector, runInInjectionContext, Renderer2, ViewEncapsulation, ViewChild, ElementRef, output, HostListener, Input, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop'
import { DOCUMENT, DatePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { register, SwiperContainer } from 'swiper/element/bundle'
import { SwiperOptions } from 'swiper/types';
import 'swiper/css'
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/API/api.service';
import { listMovies, playerTrailer } from '../../../shared/interfaces/interfaces';
import { RouterLink } from '@angular/router';
import { AnimationsService } from '../../../shared/services/animations/animations.service';
import { RatingComponent } from '../../../shared/components/rating/rating.component';
import { ComunicatorService } from '../../../shared/services/comunicator/comunicator.service';

@Component({
  selector: 'app-banner',
  imports: [DatePipe, NgOptimizedImage, RouterLink, NgClass, RatingComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None

})

export default class BannerComponent {

  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>
  onPlayTrailer = output<playerTrailer>()
  animationsService = inject(AnimationsService)
  indexCurrentElement: number = 0
  allElements: number = 0
  listMovies = input.required<listMovies | undefined>()
  movie: WritableSignal<any>= signal(undefined)
  isSwiperRegistered = false

   @HostListener("window:scroll", ['$event'])
  enableBackgroundNav(event: any) {
    let offset = event.srcElement.children[0].scrollTop
    if (offset > 20) {
      this.comunicatorService.setBackgroundNav(true)
    } else {
      this.comunicatorService.setBackgroundNav(false)
    }
  } 
  constructor(@Inject(DOCUMENT) private document: Document, public comunicatorService: ComunicatorService) {
    if (!this.isSwiperRegistered) {
      register(); // Registra Swiper solo una vez
      this.isSwiperRegistered = true;
    }
    
    this.comunicatorService.setBackgroundNav(false)
    effect(() => {
      console.log(this.listMovies())
      let results = this.listMovies()?.results.length
      this.movie.set(this.listMovies()?.results[this.indexCurrentElement])
      if (results)
        this.allElements = results
    })

    effect(() => {
       /* this.animateElements()  */
    })
  }

  ngAfterViewInit() {
    console.log('despues de la vista')
    this.initSwiper()
  }

  initSwiper() {
    const swiperOptions: SwiperOptions = {
      speed: 800,
      slidesPerView: 1,
      slidesPerGroup: 1,
      allowTouchMove: false,
      observeParents: true,
      observer: true,
      pagination: {
        enabled: true,
        dynamicBullets: true
      },
      navigation: {
        nextEl: '.swiper-next',
        prevEl: '.swiper-previous'
      },
    }
    this.swiperContainer.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      console.log('cambio')
      console.log(event.detail[0].activeIndex)
      this.indexCurrentElement = event.detail[0].activeIndex
      this.movie.set(this.listMovies()?.results[this.indexCurrentElement]) 
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

  }


  playTrailer() {
    this.onPlayTrailer.emit({
      videoId: this.getKeyTrailer(),
      isPlaying: true
    });
  }

  getKeyTrailer(): string {
    const trailer = this.movie()?.videos?.results.find((element: any) => element.type === 'Trailer');
    const key = trailer?.key || '';
    return key;
  }

  ngOnDestroy() {
    console.log('destruido')
  }

}






