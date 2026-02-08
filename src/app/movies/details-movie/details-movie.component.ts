import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, Renderer2, signal, viewChild, ViewChild, viewChildren, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { concatAll, map } from 'rxjs/operators';
import { CurrencyPipe, DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { register, SwiperContainer } from 'swiper/element/bundle'
//import { SwiperOptions } from 'swiper';
import { MinutesToTimePipe } from '../../shared/pipes/minutes-to-time/minutes-to-time.pipe';
import { ApiService } from '../../core/services/API/api.service';
import { ComunicatorService } from '../../core/services/comunicator/comunicator.service';
import { Credits } from '../../core/interfaces/people/credits.interface';
import { Movie } from '../../core/interfaces/movie/movie.interface';
import { CarouselSeriesComponent } from '../../shared/components/carousel/carousel-series/carousel-series.component';
import { SlidesInfoHook, useSlidesInfo } from '../../shared/utils/use-slides-info';
import { AutoImagePipe } from '../../shared/pipes/autoimage/auto-image.pipe';
import { SwiperOptions } from 'swiper/types';
import { IconComponent } from "../../shared/icon/icon.component";
import { CdkScrollable } from "@angular/cdk/scrolling";
import { CarouselOptions } from '../../core/interfaces/shared/carousel-interface';
import { CarouselService } from '../../core/services/carousel/carousel-service';
import { useDataLoader } from '../../shared/utils/data-loaders/use-data-loader';
import { CarouselNavigationComponent } from "../../shared/components/carousel/carousel-navigation/carousel-navigation.component";

@Component({
  selector: 'app-details-movie',
  imports: [DatePipe, NgOptimizedImage, DecimalPipe, RouterLink, MinutesToTimePipe, AutoImagePipe, IconComponent, CdkScrollable, CarouselNavigationComponent],
  providers: [CarouselService],
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

  private readonly slides = viewChildren<ElementRef<HTMLElement>>('slide')
  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carousel')
  readonly carouselService = inject(CarouselService<Credits, 'cast'>);
  readonly loader = useDataLoader<Credits, 'cast'>('cast', this.credits)

  readonly carouselOptions: CarouselOptions = {
    requiresEnrichment: false,
    orientation: 'horizontal',
    requireSnapMandatory: false,
    slidesConfig: {
      slidesPerView: 2,
      peekSkeletonOffset: 0,
      spaceBetween: 24,
      breakpoints: {
        748: { slidesPerView: 4 },
        988: { slidesPerView: 5 },
        1388: { slidesPerView: 5 }
      }
    }
  }


  isLiked = false;
  isBookmarked = false;
  slideWidth = 144
  numSlidesCrew = 1
  isSwiperHover = [false, false]
  isEnd = [false, false]
  isBeginning = [true, true]
  /* private swiperHelperCast: SwiperHelper<Movie>
  private swiperHelperCrew: SwiperHelper<Movie> */
  private static readonly SLIDE_CONFIG = {
    width: 144,
    isCarousel: true
  } as const;
  slidesInfo: SlidesInfoHook = useSlidesInfo(signal(undefined), {});

  constructor(private activeRoute: ActivatedRoute,
    private api: ApiService, private comunicatorService: ComunicatorService, private renderer: Renderer2) {
    this.carouselService.initialize(this.carouselContainer, this.carouselOptions, this.loader)
    this.comunicatorService.setBackgroundNav(true)
    this.getDetailsMovie()
    this.getCreditsMovie()
  }
  ngAfterViewInit() {

    //this.swiperHelperCast.initSwiper(this.swiperCast)
    // this.swiperHelperCrew.initSwiper(this.swiperCrew)
    this.addEventSlideChange()
    this.setEventsNavigation(this.swiperCast, 'cast')
    this.setEventsNavigation(this.swiperCrew, 'crew')
  }
  setOptionsSwiper(type: string, swiper: ElementRef<SwiperContainer>) {
    const swiperOptions: SwiperOptions = {
      slidesPerView: 'auto',
      slidesPerGroup: 4,
      spaceBetween: 18,
      navigation: {
        enabled: true,
        nextEl: `.swiper-next-${type}`,
        prevEl: `.swiper-prev-${type}`
      }
    }
    //initSwiper(swiper, swiperOptions)
  }

  addEventSlideChange() {
    this.swiperCast.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      console.log('es el final', event.detail[0].isEnd)
      this.isBeginning[0] = event.detail[0].isBeginning;
      this.isEnd[0] = event.detail[0].isEnd;
    })
    this.swiperCrew.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      this.isBeginning[1] = event.detail[0].isBeginning;
      this.isEnd[1] = event.detail[0].isEnd;
    })

  }
  setEventsNavigation(swiperContainer: ElementRef<SwiperContainer>, type: string) {
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
    let detailsMovie$ = this.activeRoute.params.pipe(
      map((params: Params) => this.api.getDetailsMovie({ dataId: params['id_movie'] })), concatAll())

    detailsMovie$.subscribe((movie: Movie) => {
      document.scrollingElement?.scrollTo(0, 0)
      this.movie.set(movie)
    })

  }

  getReleaseDate() {
    const movie = this.movie()
    if (!movie) return
    const list = movie.release_dates.results.filter((element) => element.iso_3166_1 === 'US')
    const release_dates = list[0].release_dates.filter((element) => element.certification !== '')
    console.log(release_dates[0])
    return release_dates[0]
  }

  getCreditsMovie() {
    let creditsMovie$ = this.activeRoute.params.pipe(
      map((params: Params) => this.api.getCreditsMovie({ dataId: params['id_movie'] })), concatAll())
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
