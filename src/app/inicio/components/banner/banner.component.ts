import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, signal, WritableSignal, Inject, ChangeDetectionStrategy, 
   effect,  ViewEncapsulation, ViewChild, ElementRef, output, HostListener, input } from '@angular/core';
import { DOCUMENT, DatePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { register, SwiperContainer } from 'swiper/element/bundle'
import { SwiperOptions } from 'swiper/types';
import 'swiper/css'
import { listMovies, playerTrailer } from '../../../shared/interfaces/interfaces';
import { RouterLink } from '@angular/router';
import { AnimationsService } from '../../../shared/services/animations/animations.service';
import { RatingComponent } from '../../../shared/components/rating/rating.component';
import { ComunicatorService } from '../../../shared/services/comunicator/comunicator.service';
import { LoadingComponent } from '../loading/loading.component';
import { fade } from '../../../shared/animations/animations';

@Component({
  selector: 'app-banner',
  imports: [DatePipe, NgOptimizedImage, RouterLink, NgClass, RatingComponent,LoadingComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations:[fade]

})

export default class BannerComponent {

  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>
  onPlayTrailer = output<playerTrailer>()
  animationsService = inject(AnimationsService)
  indexCurrentElement: number = 0
  listMovies = input.required<WritableSignal<listMovies | undefined>>()
  movie: WritableSignal<any>= signal(undefined)
  isSwiperRegistered = false
  isBeginning=signal(true)
  isEnd=signal(false)
  trailerID=signal('')
  isLoading: WritableSignal<boolean> = signal(false)
  requestMoreData = output<void>()

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
      this.movie.set(this.listMovies()()?.results[this.indexCurrentElement])
      this.isLoading.set(false)
      this.isEnd.set(false)
      queueMicrotask(() => {
        this.swiperContainer.nativeElement.swiper.update()       
      })
    })
    
    effect(()=>{
      console.log(this.trailerID())
      this.onPlayTrailer.emit({
        videoId:this.trailerID,
        isPlaying:false
      })
    })
  }

  ngAfterViewInit() {
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
        enabled:true,
        nextEl: '.swiper-next',
        prevEl: '.swiper-previous'
      },
    }

   
    this.swiperContainer.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      this.isBeginning.set(event.detail[0].isBeginning)
      this.isEnd.set(event.detail[0].isEnd)
      this.indexCurrentElement = event.detail[0].activeIndex
      this.movie.set(this.listMovies()()?.results[this.indexCurrentElement]) 
      this.trailerID.set(this.getKeyTrailer())
      let page = this.listMovies()()?.page ?? 0;
      let total_pages = this.listMovies()()?.total_pages ?? 0;
      
      if (this.isEnd() && (page < total_pages) && !this.isLoading()) {
        this.isLoading.set(true)
        this.requestMoreData.emit() 
      }
      this.animateElements()
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
      videoId: signal(this.getKeyTrailer()),
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






