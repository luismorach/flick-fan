import {
  ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, input, output,
  Renderer2, signal, ViewChild, ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle'
import { listMovies, playerTrailer } from '../../interfaces/interfaces';
import { DatePipe, NgClass, NgOptimizedImage} from '@angular/common';
import { SwiperOptions } from 'swiper/types';
import { PlayTrailerEmbeedComponent } from '../play-trailer-embeed/play-trailer-embeed.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { SlideSkeletonComponent } from './carousel-skeleton/slide-skeleton/slide-skeleton.component';
import { fade } from '../../animations/animations';

register(); 

@Component({
  selector: 'app-carousel',
  imports: [NgOptimizedImage, DatePipe, NgClass, PlayTrailerEmbeedComponent, SlideSkeletonComponent],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [fade]
})

export class carouselComponent {

  @ViewChild('swiper', { static: false }) swiperContainer!: ElementRef<SwiperContainer>
  @ViewChild('main') mainContainer!: ElementRef<HTMLElement>
  @ViewChild(PlayTrailerEmbeedComponent) trailerEmbeed!: PlayTrailerEmbeedComponent
  @ViewChild(PlayTrailerEmbeedComponent, { read: ElementRef }) trailerEmbeedElement !: ElementRef
  onPlayTrailer = output<playerTrailer>()
  requestMoreData = output<void>()
  listMovies = input.required<WritableSignal<listMovies | undefined>>()
  title = input.required<string>()
  importance = input.required<number>()
  numSlides: number = 1
  isEnd = signal(false)
  isBeginning = signal(true)
  hoverStates: { [key: number]: boolean } = {};
  currentIndex = 0
  isSwiperRegistered = false
  slideWidth = 320
  paddingX = 0
  spaceBetween = 12
  isLoading: WritableSignal<boolean> = signal(false)

  constructor(private renderer2: Renderer2) {
    effect(() => {
      console.log(this.listMovies()())
      this.isLoading.set(false)
      this.isEnd.set(false)
      queueMicrotask(() => {
        this.swiperContainer.nativeElement.swiper.update()       
      })
    })
  }

  ngAfterViewInit() {
     this.calculateNumSlides()
    this.initSwiper()
    this.renderer2.setAttribute(this.swiperContainer.nativeElement, 'style', `z-index:${this.importance()};`);
  }

  initSwiper() {
    const swiperOptions: SwiperOptions = {
      speed: 800,
      slidesPerView: 'auto',
      allowTouchMove: false,
      observer: true,
      observeParents: true,
      watchSlidesProgress: true,
      initialSlide: 0,
      slidesPerGroup: this.numSlides,
      spaceBetween: this.spaceBetween,
      slidesOffsetAfter: this.spaceBetween,
      navigation: {
        enabled: true,
        nextEl: `.swiper-next-${this.title()}`,
        prevEl: `.swiper-previous-${this.title()}`,
      }
    }

    this.swiperContainer.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      this.isBeginning.set(event.detail[0].isBeginning);
      this.isEnd.set(event.detail[0].isEnd);
      let page = this.listMovies()()?.page ?? 0;
      let total_pages = this.listMovies()()?.total_pages ?? 0;

      (event.detail[0].isEnd) ? this.deletePaddingToSwiperContainer() : this.setPaddingToSwiperContainer()

      if ((event.detail[0].slides.length - (this.numSlides * 2) <= event.detail[0].activeIndex)
        && (page < total_pages) && !this.isLoading()) {
        this.isLoading.set(true)
        this.requestMoreData.emit() 
      }
    })

    if (this.swiperContainer) {
      Object.assign(this.swiperContainer.nativeElement, swiperOptions)
      this.swiperContainer.nativeElement?.initialize()
      this.calculatePaddingToSetSwiperContainer()
      this.setPaddingToSwiperContainer()
      this.setStylesToFirstSlide()
    }

  }

  calculateNumSlides() {
    let containerWidth = this.mainContainer.nativeElement.scrollWidth
    if (containerWidth)
      this.numSlides = Math.floor(containerWidth / this.slideWidth)
  }

  calculatePaddingToSetSwiperContainer() {
    let containerWidth = this.mainContainer.nativeElement.scrollWidth
    let usedWith = this.numSlides * (this.slideWidth) + (this.numSlides - 1) * this.spaceBetween
    let remainingSpace = containerWidth - usedWith
    this.paddingX = Math.floor(Math.max(remainingSpace / 2, 0))
  }

  setPaddingToSwiperContainer() {
    let swiper = this.swiperContainer.nativeElement.swiper
    this.renderer2.setStyle(swiper.wrapperEl, 'padding', `0px ${this.paddingX}px`)
  }

  deletePaddingToSwiperContainer() {
    let swiper = this.swiperContainer.nativeElement.swiper
    this.renderer2.setStyle(swiper.wrapperEl, 'padding', '0px')
  }

  setStylesToFirstSlide() {
    let swiper = this.swiperContainer.nativeElement.swiper
    this.renderer2.setStyle(swiper.slides[0], 'margin-left', ((this.paddingX - this.spaceBetween) * -1) + 'px')
  }

  onMouseEnterToSlide(index: number, id: number) {
    let videoId = this.getKeyTrailer(index);
    this.hoverStates[index] = true;
    this.currentIndex = index
    if (videoId !== '') {
      this.renderer2.appendChild(this.swiperContainer.nativeElement.swiper.slides[index].firstChild,
        this.trailerEmbeedElement.nativeElement)
      this.trailerEmbeed.setPlayerVideoData(videoId, id)

      requestAnimationFrame(() => {
        this.renderer2.addClass(this.trailerEmbeedElement.nativeElement, 'active')
      })
    }
  }

  onMouseLeaveToSlide(index: number) {
    let videoId = this.getKeyTrailer(index);
    this.hoverStates[index] = false;
    if (videoId !== '') {
      this.closeTrailerPlayer()
    }
  }

  closeTrailerPlayer() {
    this.renderer2.removeClass(this.trailerEmbeedElement.nativeElement, 'active')
    this.renderer2.removeChild(this.swiperContainer.nativeElement.swiper.slides[this.currentIndex].firstChild,
      this.trailerEmbeedElement.nativeElement)
    this.trailerEmbeed.destroy()
  }

  playTrailer(index: number) {
    this.onPlayTrailer.emit({
      videoId: signal(this.getKeyTrailer(index)),
      isPlaying: true
    });
  }

  getKeyTrailer(index: number): string {
    const trailer = this.listMovies()()?.results?.[index].videos?.results.find((element: any) => element.type === 'Trailer');
    const key = trailer?.key || '';
    return key;
  }
}
