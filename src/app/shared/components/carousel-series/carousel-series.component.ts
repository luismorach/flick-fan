import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, input, output, Renderer2, signal, ViewChild, WritableSignal } from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle';
import { listSeries } from '../../interfaces/interfaces';
import { NgClass, NgOptimizedImage } from '@angular/common';
import {
  calculateNumSlides, clearAllAnimationsFrame, clearAllTimeouts, deletePaddingToSwiperContainer, getKeyTrailer,
   getRange, initSwiper,
  setPaddingToSwiperContainer, setStylesToFirstSlide, startAnimationFrame, startTimeOut,
  waitForAnimationFrame,
  waitForTransitionEnd
} from '../../utils/carousel';
import { fade } from '../../animations/animations';
import { SlideSkeletonComponent } from './slide-skeleton/slide-skeleton.component';
import { PlayTrailerEmbeedComponent } from '../play-trailer-embeed/play-trailer-embeed.component';

register();

@Component({
  selector: 'app-carousel-series',
  imports: [NgOptimizedImage, NgClass, SlideSkeletonComponent, PlayTrailerEmbeedComponent],
  templateUrl: './carousel-series.component.html',
  styleUrl: './carousel-series.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [fade]
})
export class CarouselSeriesComponent {

  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>
  @ViewChild('main') mainContainer!: ElementRef<HTMLElement>
  @ViewChild(PlayTrailerEmbeedComponent) trailerEmbeed!: PlayTrailerEmbeedComponent
  @ViewChild(PlayTrailerEmbeedComponent, { read: ElementRef }) trailerEmbeedElement !: ElementRef
  listSeries = input.required<WritableSignal<listSeries | undefined>>()
  title = input.required<string>()
  importance = input.required<number>()
  requestMoreData = output<void>()
  numSlides: number = 1
  isEnd = signal(false)
  isBeginning = signal(true)
  originalTranslate = 0
  slideWidth = 288
  spaceBetween = 40
  isLoading: WritableSignal<boolean> = signal(false)
  slidesLoading!: number[]
  currentIndex = -1

  constructor(private renderer2: Renderer2) {
    effect(() => {
      console.log(this.listSeries()())
      this.isLoading.set(false)
      this.isEnd.set(false)
      queueMicrotask(() => {
        this.swiperContainer.nativeElement.swiper.update()
      })
    })
  }


  ngAfterViewInit() {
    this.numSlides = calculateNumSlides(this.mainContainer.nativeElement.scrollWidth, this.slideWidth)
    this.slidesLoading = getRange(this.numSlides)
    initSwiper(this.swiperContainer, this.numSlides, this.spaceBetween, this.title())
    this.addEventSlideChange()
    this.addEventSlideChangeTransitionStart()
    let swiper = this.swiperContainer.nativeElement.swiper;
    setPaddingToSwiperContainer(swiper, this.spaceBetween, this.renderer2)
    setStylesToFirstSlide(swiper, this.spaceBetween, this.renderer2)
  }

  addEventSlideChange() {
    this.swiperContainer.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      this.isBeginning.set(event.detail[0].isBeginning)
      this.isEnd.set(event.detail[0].isEnd)
      let swiper = this.swiperContainer.nativeElement.swiper;

      (event.detail[0].isEnd) ? deletePaddingToSwiperContainer(swiper, this.renderer2) :
        setPaddingToSwiperContainer(swiper, this.spaceBetween, this.renderer2)

        this.loadMoreData()
    })
  }

  addEventSlideChangeTransitionStart() {
    this.swiperContainer.nativeElement.addEventListener('swiperslidechangetransitionstart', (event: any) => {
      console.log('transicion iniciada')
      this.originalTranslate = event.detail[0].translate;
    })
  }
  loadMoreData() {
    let page = this.listSeries()()?.page ?? 0;
    let total_pages = this.listSeries()()?.total_pages ?? 0;
    let swiper = this.swiperContainer.nativeElement.swiper;

    if ((swiper.slides.length - (this.numSlides * 2) <= swiper.activeIndex)
      && (page < total_pages) && !this.isLoading()) {
      this.isLoading.set(true)
      this.requestMoreData.emit()
    }
  }

  async onMouseEnterToSlide(index: number, id: number) {
    const slide = this.swiperContainer.nativeElement.swiper.slides[index]
    this.currentIndex = index
    startTimeOut(async () => {
      this.swiperContainer.nativeElement.swiper.disable()
      this.expandSlide(slide)
      this.animateImageChange(slide, 0, 1);
      this.adjustSwiperPosition(slide)
      this.moveAndPlayTrailer(slide, this.currentIndex, 0)
    }, 500)
  }

  private expandSlide(slide: HTMLElement) {
    startAnimationFrame(() => {
      this.renderer2.setStyle(slide, 'width', `${Math.floor(this.slideWidth * 2.8)}px`)
      this.renderer2.setStyle(slide, 'transition', 'width .5s cubic-bezier(.2,.45,0,1)')
    })
  }

  private animateImageChange(slide: HTMLElement, posterOpacity: number, hoverOpacity: number) {
    const poster = slide.children[0]
    const hover = slide.children[1]

    if (!poster && !hover) return

    startAnimationFrame(() => {
      this.renderer2.setStyle(poster, 'transition', 'opacity .5s cubic-bezier(.2,.45,0,1)')
      this.renderer2.setStyle(poster, 'opacity', `${posterOpacity}`);
      this.renderer2.setStyle(hover, 'transition', 'opacity .5s cubic-bezier(.2,.45,0,1)')
      this.renderer2.setStyle(hover, 'opacity', `${hoverOpacity}`);
    })
  }

  private async adjustSwiperPosition(slide: HTMLElement) {
    const viewportWidth = this.swiperContainer.nativeElement.offsetWidth;
    let newTranslate = this.originalTranslate;
    console.log(slide.offsetLeft, viewportWidth, newTranslate)

    if (newTranslate + (slide.offsetLeft + Math.floor(this.slideWidth * 2.9)) > viewportWidth) {
      newTranslate = (viewportWidth - (slide.offsetLeft + Math.floor(this.slideWidth * 2.9)))
    } /* else if (newTranslate + slide.offsetLeft < 0) {
      newTranslate -= slide.offsetLeft + newTranslate - this.spaceBetween;
    } */

    // Desactivar temporalmente la interacción
    this.swiperContainer.nativeElement.swiper.allowTouchMove = false;
    this.swiperContainer.nativeElement.swiper.translateTo(newTranslate, 500);
    this.swiperContainer.nativeElement.swiper.allowTouchMove = true;


  }

  private moveAndPlayTrailer(slide: HTMLElement, index: number, id: number) {
    let videoId = getKeyTrailer(index, this.listSeries()());

    if (videoId === '') return

    this.renderer2.appendChild(slide, this.trailerEmbeedElement.nativeElement);
    this.renderer2.setStyle(this.trailerEmbeedElement.nativeElement, 'width', `${Math.floor(this.slideWidth * 2.8)}px`)
    this.trailerEmbeed.setPlayerVideoData(videoId, id)
    startAnimationFrame(() => {
      this.renderer2.addClass(this.trailerEmbeedElement.nativeElement, 'active')
    })
  }

  onMouseLeaveToSlide(index: number) {
    clearAllTimeouts()
    clearAllAnimationsFrame()
    this.resetSlide(index)
  }

  private resetSlide(index: number) {
    const slide = this.swiperContainer.nativeElement.swiper.slides[index] as HTMLElement;
    this.closeTrailerPlayer()
    this.swiperContainer.nativeElement.swiper.translateTo(this.originalTranslate, 500);
    startTimeOut(async () => {
      this.collapseSlide(slide)
      this.animateImageChange(slide, 1, 0)

      await waitForTransitionEnd(slide)
      await waitForAnimationFrame()

      this.swiperContainer.nativeElement.swiper.enable()
      this.swiperContainer.nativeElement.swiper.update()
      this.swiperContainer.nativeElement.swiper.allowTouchMove = true;
    }, 500)
  }

  closeTrailerPlayer() {
    this.renderer2.removeClass(this.trailerEmbeedElement.nativeElement, 'active')
    this.renderer2.removeChild(this.swiperContainer.nativeElement.swiper.slides[this.currentIndex],
      this.trailerEmbeedElement.nativeElement)
    this.trailerEmbeed.destroy()
  }

  collapseSlide(slide: HTMLElement) {
    startAnimationFrame(() => {
      this.renderer2.setStyle(slide, 'width', `${this.slideWidth}px`);
    })
  }
}
