import {
  ChangeDetectionStrategy, Component, ContentChild, contentChild, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, input, output,
  Renderer2, signal, viewChild, ViewChild, ViewContainerRef, ViewEncapsulation
} from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle'
import { listMovies, playerTrailer } from '../../interfaces/interfaces';
import { DatePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { SwiperOptions } from 'swiper/types';
import { UrlSafePipe } from '../../pipes/url-safe.pipe';
import { Router } from '@angular/router';
import { PlayTrailerEmbeedComponent } from '../play-trailer-embeed/play-trailer-embeed.component';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
  selector: 'app-carrousel',
  imports: [NgOptimizedImage, DatePipe, NgClass, UrlSafePipe, PlayTrailerEmbeedComponent],
  templateUrl: './carrousel.component.html',
  styleUrl: './carrousel.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class carrouselComponent {

  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>
  @ViewChild('main') mainContainer!: ElementRef<HTMLElement>
  @ViewChild('parent') parentContainer!: ElementRef<HTMLElement>
  @ViewChild(PlayTrailerEmbeedComponent) trailerEmbeed!: PlayTrailerEmbeedComponent
  @ViewChild(PlayTrailerEmbeedComponent, { read: ElementRef }) trailerEmbeedElement !: ElementRef
  onPlayTrailer = output<playerTrailer>()
  listMovies = input.required<listMovies | undefined>()
  title = input.required<string>()
  importance = input.required<number>()
  numSlides: number = 1
  isEnd = signal(false)
  isBeginning = signal(true)
  gap = 0
  hoverStates: { [key: number]: boolean } = {};
  currentIndex = 0
  isSwiperRegistered = false
  trailer

  constructor(private renderer2: Renderer2, private router: Router) {
    if (!this.isSwiperRegistered) {
      register(); // Registra Swiper solo una vez
      this.isSwiperRegistered = true;
    }
    this.trailer = this.renderer2.createElement('YouTubePlayer')

  }

  ngAfterViewInit() {
    this.initSwiper()/* 
   this.renderer2.removeChild(this.mainContainer.nativeElement,this.trailerEmbeedElement.nativeElement)   */
  }

  initSwiper() {
    this.renderer2.setAttribute(this.swiperContainer.nativeElement, 'style', `z-index:${this.importance()};`);
    this.calculateNumSlides()
    const swiperOptions: SwiperOptions = {
      speed: 800,
      slidesPerView: this.numSlides,
      allowTouchMove: false,
      observer: true,
      observeParents: true,
      spaceBetween: 16,
      slidesPerGroup: this.numSlides,
      navigation: {
        enabled: true,
        nextEl: `.swiper-next-${this.title()}`,
        prevEl: `.swiper-previous-${this.title()}`,

      }
    }

    this.swiperContainer.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      this.isBeginning.set(event.detail[0].isBeginning)
      this.isEnd.set(event.detail[0].isEnd)
      if (event.detail[0].isEnd && event.detail[0].slidesGrid.length % this.numSlides !== 0) {
        this.gap = this.numSlides - (event.detail[0].slidesGrid.length % this.numSlides)
      } else
        this.gap = 0
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

  mouseEnter(index: number) {
    let videoId = this.getKeyTrailer(index);
    this.hoverStates[index] = true;
    this.currentIndex = index
    if (videoId !== '') {

      this.renderer2.appendChild(this.swiperContainer.nativeElement.swiper.slides[index].firstChild,
        this.trailerEmbeedElement.nativeElement)
      this.trailerEmbeed.createPlayer(videoId)

      requestAnimationFrame(() => {
        this.renderer2.addClass(this.trailerEmbeedElement.nativeElement, 'active')
      })
    }
  }


  mouseLeave(index: number) {
    console.log('saklienod')
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
    const trailer = this.listMovies()?.results?.[index].videos?.results.find((element: any) => element.type === 'Trailer');
    const key = trailer?.key || '';
    return key;
  }
}
