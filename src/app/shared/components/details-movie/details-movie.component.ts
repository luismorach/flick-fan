import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Renderer2, signal, ViewChild, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { ApiService } from '../../services/API/api.service';
import { ComunicatorService } from '../../services/comunicator/comunicator.service';
import { concatAll, map } from 'rxjs/operators';
import { Credits, Movie } from '../../interfaces/interfaces';
import { CurrencyPipe, DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { register, SwiperContainer } from 'swiper/element/bundle'
import 'swiper/css'
import { getSquareImage, getTallImage, getWideImage } from '../../utils/images-by-default';
import { MinutesToTimePipe } from '../../pipes/minutes-to-time.pipe';
import { calculateNumSlides, initSwiper, setOptionsToSwiperWhitMultiplesSlidesPerView } from '../../utils/helpers';
import { SwiperOptions } from 'swiper/types/swiper-options';
register();

@Component({
  selector: 'app-details-movie',
  imports: [DatePipe, NgOptimizedImage, DecimalPipe, CurrencyPipe, RouterLink, MinutesToTimePipe],
  templateUrl: './details-movie.component.html',
  styleUrl: './details-movie.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class DetailsMovieComponent {
  movie: WritableSignal<Movie | undefined> = signal(undefined)
  credits: WritableSignal<Credits | undefined> = signal(undefined)
  @ViewChild('swiperCast', { static: false }) swiperCast!: ElementRef<SwiperContainer>
  @ViewChild('containerCast') containerCast!: ElementRef<HTMLElement>
  @ViewChild('swiperCrew', { static: false }) swiperCrew!: ElementRef<SwiperContainer>
  @ViewChild('containerCrew') containerCrew!: ElementRef<HTMLElement>
  isLiked = false;
  isBookmarked = false;
  slideWidth = 144
  numSlidesCrew = 1
  isSwiperHover = [false, false]
  isEnd = [false, false]
  isBeginning = [true, true]
  getTallImage = getTallImage
  getWideImage = getWideImage
  getSquareImage = getSquareImage

  constructor(private rutaActiva: ActivatedRoute,
    private api: ApiService, private comunicatorService: ComunicatorService, private renderer: Renderer2) {
    this.comunicatorService.setBackgroundNav(true)
    this.getDetailsMovie()
    this.getCreditsMovie()
  }
  ngAfterViewInit() {
     const numSlides = calculateNumSlides(this.containerCrew.nativeElement.scrollWidth, this.slideWidth+18)
    console.log(numSlides)
    const swiperOptions=setOptionsToSwiperWhitMultiplesSlidesPerView(numSlides,18)
    initSwiper(this.swiperCast,swiperOptions)
    initSwiper(this.swiperCrew,swiperOptions)
    this.addEventSlideChange()
    this.setEventsNavigation(this.swiperCast,'cast')
    this.setEventsNavigation(this.swiperCrew,'crew')
  }
  setOptionsSwiper(type: string,swiper:ElementRef<SwiperContainer>) {
    const numSlides = calculateNumSlides(this.containerCrew.nativeElement.scrollWidth, this.slideWidth+18)
    console.log(numSlides)
    const swiperOptions: SwiperOptions = {
      slidesPerView: 'auto',
      slidesPerGroup: numSlides,
      spaceBetween: 18,
      navigation: {
        enabled: true,
        nextEl: `.swiper-next-${type}`,
        prevEl: `.swiper-prev-${type}`
      }
    }
    initSwiper(swiper,swiperOptions)
  }

  addEventSlideChange() {
    this.swiperCast.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      console.log('es el final',event.detail[0].isEnd)
      this.isBeginning[0] = event.detail[0].isBeginning;
      this.isEnd[0] = event.detail[0].isEnd;
    })
    this.swiperCrew.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      this.isBeginning[1] = event.detail[0].isBeginning;
      this.isEnd[1] = event.detail[0].isEnd;
    })

  }
    setEventsNavigation(swiperContainer:ElementRef<SwiperContainer>,type:string) {
    let swiper = swiperContainer.nativeElement.swiper;
    const prevProxy = document.querySelector(`.swiper-prev-${type}`) as HTMLElement;
    const nextProxy = document.querySelector(`.swiper-next-${type}`) as HTMLElement;

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


  getDetailsMovie() {
    let detailsMovie$ = this.rutaActiva.params.pipe(
      map((params: Params) => this.api.getDetailsMovie(params['id_movie'])), concatAll())

    detailsMovie$.subscribe((movie: Movie) => {
      document.scrollingElement?.scrollTo(0, 0)
      this.movie.set(movie)
    })

  }

  getCreditsMovie() {
    let creditsMovie$ = this.rutaActiva.params.pipe(
      map((params: Params) => this.api.getCreditsMovie(params['id_movie'])), concatAll())
    creditsMovie$.subscribe((credits: Credits) => this.credits.set(credits))

  }
  getBackgroundImage(): string {
    return `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(http://image.tmdb.org/t/p/original${this.movie()?.backdrop_path})`;
  }

  toggleLike(): void {
    this.isLiked = !this.isLiked;
  }

  toggleBookmark(): void {
    this.isBookmarked = !this.isBookmarked;
  }

  getLikeButtonClass(): string {
    return `p-3 rounded-full border-2 transition-all transform hover:scale-110 ${this.isLiked
      ? 'bg-red-500 border-red-500 text-white'
      : 'border-white/30 text-white hover:border-red-500 hover:text-red-500'
      }`;
  }

  getBookmarkButtonClass(): string {
    return `p-3 rounded-full border-2 transition-all transform hover:scale-110 ${this.isBookmarked
      ? 'bg-red-500 border-red-500 text-white'
      : 'border-white/30 text-white hover:border-red-500 hover:text-red-500'
      }`;
  }
}
