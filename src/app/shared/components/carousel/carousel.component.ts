import {
  ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, input, output,
  Renderer2, signal, ViewChild, ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle'
import { NgClass} from '@angular/common';
import { CardMovieSkeletonComponent } from './card-movie-skeleton/card-movie-skeleton.component';
import { fade } from '../../animations/animations';
import {
  calculateNumSlides, calculatePaddingToSetSwiperContainer,
  deletePaddingToSwiperContainer, getRange, initSwiper, setOptionsToSwiperWhitMultiplesSlidesPerView, setPaddingToSwiperContainer, setStylesToFirstSlide, startAnimationFrame
} from '../../utils/helpers';
import { CardMovieComponent } from './card-movie/card-movie.component';
import { PlayerTrailer } from '../../../core/interfaces/shared/player.interface';
import { MovieList } from '../../../core/interfaces/movie/movie.interface';


register();

@Component({
  selector: 'app-carousel',
  imports: [NgClass, CardMovieSkeletonComponent, CardMovieComponent],
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
  onPlayTrailer = output<PlayerTrailer>()
  requestMoreData = output<void>()
  listMovies = input.required<WritableSignal<MovieList | undefined>>()
  title = input.required<string>()
  importance = input.required<number>()
  id = input.required<string>()
  numSlides: number = 1
  isEnd = signal(false)
  isBeginning = signal(true)
  hoverStates: { [key: number]: boolean } = {};
  currentIndex = 0
  slideWidth = 320
  paddingX = 0
  spaceBetween = 12
  isLoading: WritableSignal<boolean> = signal(false)
  slidesLoading!: number[]
  isSwiperHover = false

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
    this.numSlides = calculateNumSlides(this.mainContainer.nativeElement.scrollWidth, this.slideWidth+this.spaceBetween)
    this.slidesLoading = getRange(this.numSlides)
    const swiperOptions = setOptionsToSwiperWhitMultiplesSlidesPerView(this.numSlides, this.spaceBetween)
    initSwiper(this.swiperContainer, swiperOptions)
    this.addEventSlideChange()
    this.renderer2.setAttribute(this.swiperContainer.nativeElement, 'style', `z-index:${this.importance()};`);

    let swiper = this.swiperContainer.nativeElement.swiper;
    calculatePaddingToSetSwiperContainer(swiper, this.spaceBetween)
    setPaddingToSwiperContainer(swiper, this.spaceBetween, this.renderer2)
    /*     setStylesToFirstSlide(swiper, this.spaceBetween, this.renderer2) */
    this.setEventsNavigation()
  }

  addEventSlideChange() {
    this.swiperContainer.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      this.isBeginning.set(event.detail[0].isBeginning);
      this.isEnd.set(event.detail[0].isEnd);
      let swiper = this.swiperContainer.nativeElement.swiper;

      (event.detail[0].isEnd) ? deletePaddingToSwiperContainer(swiper, this.renderer2) :
        setPaddingToSwiperContainer(swiper, this.spaceBetween, this.renderer2)

      this.loadMoreData()
    })
  }

 

  loadMoreData() {
    let page = this.listMovies()()?.page ?? 0;
    let total_pages = this.listMovies()()?.total_pages ?? 0;

    if (page < total_pages) {
      this.isLoading.set(true)
    }
    if (this.isEnd() && (page < total_pages)) {
      this.requestMoreData.emit()
    }
  }

   setEventsNavigation() {
    let swiper = this.swiperContainer.nativeElement.swiper;
    const prevProxy = document.querySelector(`.proxy-prev-${this.id()}`) as HTMLElement;
    const nextProxy = document.querySelector(`.proxy-next-${this.id()}`) as HTMLElement;

    nextProxy.addEventListener('click', () => {
      if (!swiper.animating) {
        swiper.update()
        swiper.slideNext();
      }
    });

    prevProxy.addEventListener('click', () => {
      if (!swiper.animating) {
        swiper.update()
        swiper.slidePrev();
      }
    });
  }
/* 
  onMouseEnterToSlide(index: number, id: number) {
    let videoId = getKeyTrailer(index, this.listMovies()());
    this.hoverStates[index] = true;
    this.currentIndex = index
    if (videoId === '') return

    this.renderer2.appendChild(this.swiperContainer.nativeElement.swiper.slides[index].firstChild,
      this.trailerEmbeedElement.nativeElement)
    this.trailerEmbeed.setPlayerVideoData(videoId, id)

    startAnimationFrame(() => {
      this.renderer2.addClass(this.trailerEmbeedElement.nativeElement, 'active')
    })
  }

  onMouseLeaveToSlide(index: number) {
    let videoId = getKeyTrailer(index, this.listMovies()());
    this.hoverStates[index] = false;

    if (videoId === '') return

    this.closeTrailerPlayer()
    clearAllAnimationsFrame() 
  }

  closeTrailerPlayer() {
    this.renderer2.removeClass(this.trailerEmbeedElement.nativeElement, 'active')
    this.renderer2.removeChild(this.swiperContainer.nativeElement.swiper.slides[this.currentIndex].firstChild,
      this.trailerEmbeedElement.nativeElement)
    this.trailerEmbeed.destroy()
  }

  playTrailer(index: number) {
    this.onPlayTrailer.emit({
      videoId: signal(getKeyTrailer(index, this.listMovies()())),
      isPlaying: true
    });
  } */


}
