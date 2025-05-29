import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, input, Renderer2, signal, ViewChild } from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle';
import { listSeries } from '../../interfaces/interfaces';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { SwiperOptions } from 'swiper/types';

register();

@Component({
  selector: 'app-carousel-series',
  imports: [NgOptimizedImage, NgClass],
  templateUrl: './carousel-series.component.html',
  styleUrl: './carousel-series.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CarouselSeriesComponent {

  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>
  @ViewChild('main') mainContainer!: ElementRef<HTMLElement>
  /* onPlayTrailer = output<playerTrailer>() */
  listSeries = input.required<listSeries | undefined>()
  title = input.required<string>()
  importance = input.required<number>()
  numSlides: number = 1
  isEnd = signal(false)
  isBeginning = signal(true)
  wait!: any
  gap = 0
  hoverStates: { [key: number]: boolean } = {};
  mutedStates: { [key: number]: boolean } = {};
  playerStates: { [key: number]: number } = {};
  isSwiperRegistered = false
  player: any
  originalTranslate = 0

  constructor(private renderer2: Renderer2) { }

  mouseEnter(index: number) {
    /* let videoId = this.getKeyTrailer(index); */

    this.hoverStates[index] = true;
    this.mutedStates[index] = true;
    let slide = this.swiperContainer.nativeElement.swiper.slides[index];
    let containerWidth = this.swiperContainer.nativeElement.offsetWidth;
    this.wait = setTimeout(() => {
      this.originalTranslate = this.swiperContainer.nativeElement.swiper.getTranslate();
      this.setStyles(slide);
      if (this.originalTranslate + (slide.offsetLeft + Math.floor(containerWidth * 0.6)) > containerWidth) {
        this.swiperContainer.nativeElement.swiper.translateTo(
          (containerWidth - ((slide.offsetLeft + Math.floor(containerWidth * 0.6)))), 500);

        this.swiperContainer.nativeElement.swiper.setTranslate(
          (containerWidth - ((slide.offsetLeft + Math.floor(containerWidth * 0.6))))) 
      }
    }, 500);
   /*  console.log(slide.offsetLeft, this.originalTranslate, containerWidth, (Math.floor(containerWidth * 0.6)));
    console.log(
      (containerWidth - ((slide.offsetLeft + Math.floor(containerWidth * 0.6)))) - 20) */
  }

  setStyles(slide: HTMLElement) {
    slide.style.width = '60vw'
    slide.style.transition = 'width .5s cubic-bezier(.2,.45,0,1)';
    slide.children[0].setAttribute('style', 'transition: opacity 1s cubic-bezier(.2,.45,0,1);')
    slide.children[1].setAttribute('style', 'transition: opacity 1s cubic-bezier(.2,.45,0,1);')
    slide.children[0].setAttribute('style', 'opacity:0%;')
    slide.children[1].setAttribute('style', 'opacity:100%;')

  }
  clearStyles(slide: HTMLElement) {
    setTimeout(() => {
    slide.style.transition = 'width .5s cubic-bezier(.2,.45,0,1)';
    slide.children[0].setAttribute('style', 'transition: opacity 5s cubic-bezier(.2,.45,0,1);')
    slide.children[1].setAttribute('style', 'transition: opacity 5s cubic-bezier(.2,.45,0,1);')
    slide.children[0].setAttribute('style', 'opacity:100%;')
    slide.children[1].setAttribute('style', 'opacity:0%;')
    slide.style.width = '18rem'
    }, 300);
  }

  mouseLeave(index: number) {
    this.hoverStates[index] = false;
    clearTimeout(this.wait);
    let slide = this.swiperContainer.nativeElement.swiper.slides[index];
    console.log(this.originalTranslate,'saliendo');
    /*  this.swiperContainer.nativeElement.swiper.translateTo(this.originalTranslate, 500);  */
    this.swiperContainer.nativeElement.swiper.setTranslate(this.originalTranslate); 
    this.clearStyles(slide);

    /* if (this.player)
      this.player.destroy(); */
  }

  ngAfterViewInit() {
    this.initSwiper()
  }

  initSwiper() {
    this.renderer2.setAttribute(this.swiperContainer.nativeElement, 'style', `z-index:${this.importance()};`);
    this.calculateNumSlides()
    const swiperOptions: SwiperOptions = {
      speed: 800,
      slidesPerView: 'auto',
      slidesPerGroup: this.numSlides,
      allowTouchMove: false,
      navigation: {
        enabled: true,
        nextEl: `.swiper-next`,
        prevEl: `.swiper-previous`,

      }
    }

    this.swiperContainer.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      this.isBeginning.set(event.detail[0].isBeginning)
      this.isEnd.set(event.detail[0].isEnd)
      this.originalTranslate = event.detail[0].translate

      /* if (event.detail[0].isEnd && event.detail[0].slidesGrid.length % this.numSlides !== 0) {
        this.gap = this.numSlides - (event.detail[0].slidesGrid.length % this.numSlides)
      } else
        this.gap = 0 */
    })

    if (this.swiperContainer) {
      Object.assign(this.swiperContainer.nativeElement, swiperOptions)
      this.swiperContainer.nativeElement?.initialize()
    }

  }

  calculateNumSlides() {
    let width = this.mainContainer.nativeElement.scrollWidth
    if (width)
      this.numSlides = Math.floor(width / 320)
  }
}
