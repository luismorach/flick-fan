import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, input, output, Renderer2, signal, ViewChild, WritableSignal } from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle';
import { listSeries } from '../../interfaces/interfaces';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { SwiperOptions } from 'swiper/types'; import { calculateNumSlides, calculatePaddingToSetSwiperContainer, deletePaddingToSwiperContainer, getRangeSlidesLoading, initSwiper, setPaddingToSwiperContainer, setStylesToFirstSlide } from '../../utils/carousel';
import { fade } from '../../animations/animations';
import { SlideSkeletonComponent } from './slide-skeleton/slide-skeleton.component';

register();

@Component({
  selector: 'app-carousel-series',
  imports: [NgOptimizedImage, NgClass,SlideSkeletonComponent],
  templateUrl: './carousel-series.component.html',
  styleUrl: './carousel-series.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations:[fade]
})
export class CarouselSeriesComponent {

  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>
  @ViewChild('main') mainContainer!: ElementRef<HTMLElement>
  /* onPlayTrailer = output<playerTrailer>() */
  listSeries = input.required<WritableSignal<listSeries | undefined>>()
  title = input.required<string>()
  importance = input.required<number>()
  requestMoreData = output<void>()
  numSlides: number = 1
  isEnd = signal(false)
  isBeginning = signal(true)
  wait!: any
  hoverStates: { [key: number]: boolean } = {};
  mutedStates: { [key: number]: boolean } = {};
  playerStates: { [key: number]: number } = {};
  isSwiperRegistered = false
  player: any
  originalTranslate = 0
  slideWidth = 288
  spaceBetween = 40
  isLoading: WritableSignal<boolean> = signal(false)
  slidesLoading!: number[]

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
    this.slidesLoading = getRangeSlidesLoading(this.numSlides)
    initSwiper(this.swiperContainer, this.numSlides, this.spaceBetween, this.title())
    this.addEventSlideChange()
    let swiper = this.swiperContainer.nativeElement.swiper;
    setPaddingToSwiperContainer(swiper, this.spaceBetween, this.renderer2)
    setStylesToFirstSlide(swiper, this.spaceBetween, this.renderer2)
  }

  addEventSlideChange() {
    this.swiperContainer.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      this.isBeginning.set(event.detail[0].isBeginning)
      this.isEnd.set(event.detail[0].isEnd)
      this.originalTranslate = event.detail[0].translate;
      let page = this.listSeries()()?.page ?? 0;
      let total_pages = this.listSeries()()?.total_pages ?? 0;
      let swiper = this.swiperContainer.nativeElement.swiper;

      (event.detail[0].isEnd) ? deletePaddingToSwiperContainer(swiper, this.renderer2) :
        setPaddingToSwiperContainer(swiper, this.spaceBetween, this.renderer2)

      if ((event.detail[0].slides.length - (this.numSlides * 2) <= event.detail[0].activeIndex)
        && (page < total_pages) && !this.isLoading()) {
        this.isLoading.set(true)
        this.requestMoreData.emit()
      }
    })
  }

  mouseEnter(index: number) {
    this.hoverStates[index] = true;
    this.mutedStates[index] = true;
    let slide = this.swiperContainer.nativeElement.swiper.slides[index];
    let containerWidth = this.swiperContainer.nativeElement.offsetWidth;
    this.wait = setTimeout(() => {
      this.originalTranslate = this.swiperContainer.nativeElement.swiper.getTranslate();
      this.setStyles(slide);
      console.log(slide.clientWidth)
      if (this.originalTranslate + (slide.offsetLeft + Math.floor(this.slideWidth*2.9)) > containerWidth) {
        this.swiperContainer.nativeElement.swiper.translateTo(
          (containerWidth - (slide.offsetLeft + Math.floor(this.slideWidth*2.9))), 500);

        this.swiperContainer.nativeElement.swiper.setTranslate(
          (containerWidth - (slide.offsetLeft + Math.floor(this.slideWidth*2.9))))
      }
    }, 500);
  }

  setStyles(slide: HTMLElement) {
    slide.style.width = `${Math.floor(this.slideWidth*2.8)}px`
    slide.style.transition = 'width .5s cubic-bezier(.2,.45,0,1)';
    slide.children[0].setAttribute('style', 'transition: opacity 3s cubic-bezier(.2,.45,0,1);')
    slide.children[1].setAttribute('style', 'transition: opacity 3s cubic-bezier(.2,.45,0,1);')
    slide.children[0].setAttribute('style', 'opacity:0%;')
    slide.children[1].setAttribute('style', 'opacity:100%;')
  }

  clearStyles(slide: HTMLElement) {
    setTimeout(() => {
      slide.style.transition = 'width .5s cubic-bezier(.2,.45,0,1)';
      slide.children[0].setAttribute('style', 'transition: opacity .1s cubic-bezier(.2,.45,0,1);')
      slide.children[1].setAttribute('style', 'transition: opacity .1s cubic-bezier(.2,.45,0,1);')
      slide.children[0].setAttribute('style', 'opacity:100%;')
      slide.children[1].setAttribute('style', 'opacity:0%;')
      slide.style.width = '18rem'
    }, 300);
  }

  mouseLeave(index: number) {
    this.hoverStates[index] = false;
    clearTimeout(this.wait);
    let slide = this.swiperContainer.nativeElement.swiper.slides[index];
    console.log(slide.clientWidth)
    console.log(this.originalTranslate, 'saliendo');
    this.swiperContainer.nativeElement.swiper.setTranslate(this.originalTranslate);
    this.clearStyles(slide);
  }
}
