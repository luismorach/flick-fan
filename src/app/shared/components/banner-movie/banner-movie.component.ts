import {
  Component, inject, CUSTOM_ELEMENTS_SCHEMA, signal, WritableSignal, Inject, ChangeDetectionStrategy,
  effect, ViewEncapsulation, ViewChild, ElementRef, output, HostListener, input
} from '@angular/core';
import { DOCUMENT, DatePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { register, SwiperContainer } from 'swiper/element/bundle'
import { SwiperOptions } from 'swiper/types';
import 'swiper/css'
import { RouterLink } from '@angular/router';
import { AnimationConfig, AnimationsService } from '../../../core/services/animations/animations.service';
import { RatingComponent } from '../rating/rating.component';
import { ComunicatorService } from '../../../core/services/comunicator/comunicator.service';
import { fade } from '../../animations/animations';
import { MinutesToTimePipe } from '../../pipes/minutes-to-time.pipe';
import { BannerSkeletonComponent } from './banner-skeleton/banner-skeleton.component';
import { PlayerTrailer } from '../../../core/interfaces/shared/player.interface';
import { MovieList, Movie } from '../../../core/interfaces/movie/movie.interface';
import { MovieSwiperComponent } from './movie-swiper/movie-swiper.component';
import { getKeyTrailer } from '../../utils/helpers';
import { DataLoaderManager } from '../../utils/data-loader-manager';
register()

@Component({
  selector: 'app-banner-movie',
  imports: [DatePipe, NgOptimizedImage, RouterLink, NgClass, RatingComponent,
    MinutesToTimePipe, BannerSkeletonComponent, MovieSwiperComponent],
  templateUrl: './banner-movie.component.html',
  styleUrl: './banner-movie.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [fade]
})

export default class BannerMovieComponent {

  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>
  onPlayTrailer = output<PlayerTrailer>()
  animationsService = inject(AnimationsService)
  indexCurrentElement: number = 0
  movieList = input.required<WritableSignal<MovieList | undefined>>()
  movie: WritableSignal<Movie | undefined> = signal(undefined)
  isBeginning = signal(true)
  isEnd = signal(false)
  requestMoreData = output<void>()
  isSwiperHover = false
  private paginationObserver?: MutationObserver;
  private shadowChildObserver?: MutationObserver;
  readonly dataLoaderManager: DataLoaderManager = inject(DataLoaderManager)

  constructor(@Inject(DOCUMENT) private document: Document, public comunicatorService: ComunicatorService) {
    effect(() => {
      this.movie.set(this.movieList()()?.results[this.indexCurrentElement])
      this.isEnd.set(false)
      this.dataLoaderManager.completeFetch()
      queueMicrotask(() => {
        this.swiperContainer.nativeElement.swiper.update()
      })
    })

    effect(() => {
      if (!this.movie())return
      console.log(this.movie())
      const trailerKey = getKeyTrailer(this.movie())
      this.onPlayTrailer.emit({
        videoId: signal(trailerKey),
        isPlaying: false
      })
    })
  }

  ngAfterViewInit() {
    this.swiperContainer.nativeElement.injectStyles = [
      `
        :host ::part(pagination) {
          width: 120px !important;
        }
      `
    ];
    this.initSwiper()
    this.addEventSlideChange()
    this.changeWidthPagination()
  }

  initSwiper() {
    const swiperOptions: SwiperOptions = {
      speed: 500,
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
        enabled: true,
        nextEl: '.swiper-next',
        prevEl: '.swiper-previous'
      },
    }

    if (this.swiperContainer) {
      Object.assign(this.swiperContainer.nativeElement, swiperOptions)
      this.swiperContainer.nativeElement?.initialize()

    }


  }
  addEventSlideChange() {
    this.swiperContainer.nativeElement.addEventListener('swiperslidechange', (event: any) => {

      this.isBeginning.set(event.detail[0].isBeginning)
      this.isEnd.set(event.detail[0].isEnd)
      this.indexCurrentElement = event.detail[0].activeIndex
      this.movie.set(this.movieList()()?.results[this.indexCurrentElement])
      if (this.isEnd()){
        console.log('cargando mas')
        this.dataLoaderManager.loadMoreData(this.movieList())
      }
      //this.loadMoreData()
      this.animateElements()
    })
  }

  loadMoreData() {
    console.log('indeexx', this.indexCurrentElement)
    let page = this.movieList()()?.page ?? 0;
    let total_pages = this.movieList()()?.total_pages ?? 0;
    if (this.isEnd() && (page < total_pages)) {
      this.requestMoreData.emit()
    }
  }

  changeWidthPagination() {
    // 3) fallback: si Swiper sigue reescribiendo el style inline, observamos y lo forzamos
    const swiper = this.swiperContainer.nativeElement
    const shadow = swiper.shadowRoot;
    if (!shadow) return;

    // si el pagination ya existe, observa directamente; si no, observa creación de nodos
    const ensureObserve = (paginationEl: HTMLElement) => {
      // aplicar al inicio
      paginationEl.style.setProperty('width', '110px', 'important');

      // observa cambios al atributo style y re-aplica
      this.paginationObserver = new MutationObserver((mutations) => {
        // re-aplica cada vez que cambie el style
        paginationEl.style.setProperty('width', '110px', 'important');
      });

      this.paginationObserver.observe(paginationEl, { attributes: true, attributeFilter: ['style'] });
    };

    const pagination = shadow.querySelector('[part="pagination"]') as HTMLElement | null;
    if (pagination) {
      ensureObserve(pagination);
    } else {
      // puede crearse después: observar childList dentro del shadow root
      this.shadowChildObserver = new MutationObserver(() => {
        const pag = shadow.querySelector('[part="pagination"]') as HTMLElement | null;
        if (pag) {
          ensureObserve(pag);
          this.shadowChildObserver?.disconnect();
          this.shadowChildObserver = undefined;
        }
      });
      this.shadowChildObserver.observe(shadow, { childList: true, subtree: true });
    }

  }

  animateElements() {
    const title = this.document.getElementById('title')
    const overview = this.document.getElementById('overview')
    const genres = this.document.getElementById('genres')
    const release = this.document.getElementById('release')
    const buttons = this.document.getElementById('buttons')

    let animationsConfig: AnimationConfig = {
      duration: '400ms',
      delay: '400ms',
      startPosition: '-150%',
      endPosition: '0'
    }

    let playerTitle = this.animationsService.moveX(animationsConfig).create(title)
    playerTitle.play()

    let playerRating = this.animationsService.moveX(animationsConfig).create(release)
    playerRating.play()

    let playerGenres = this.animationsService.moveX(animationsConfig).create(genres)
    playerGenres.play()

    animationsConfig.delay = '700ms'
    animationsConfig.startPosition = '100%'
    let playerOverview = this.animationsService.moveY(animationsConfig).create(overview)
    playerOverview.play()

    animationsConfig.delay = '1000ms'
    animationsConfig.startPosition = '3%'
    let playerButtons = this.animationsService.moveY(animationsConfig).create(buttons)
    playerButtons.play()
  }

  playTrailer() {
    const trailerKey = getKeyTrailer(this.movie())
    this.onPlayTrailer.emit({
      videoId: signal(trailerKey),
      isPlaying: true
    });
  }


  ngOnDestroy(): void {
    this.paginationObserver?.disconnect();
    this.shadowChildObserver?.disconnect();
  }


}






