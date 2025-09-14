import {
  Component, inject, CUSTOM_ELEMENTS_SCHEMA, signal, WritableSignal, Inject, ChangeDetectionStrategy,
  effect, ViewEncapsulation, ViewChild, ElementRef, output, HostListener, input
} from '@angular/core';
import { DOCUMENT, DatePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { register, SwiperContainer } from 'swiper/element/bundle'
import { SwiperOptions } from 'swiper/types';
import 'swiper/css'
import { RouterLink } from '@angular/router';
import { AnimationsService } from '../../../core/services/animations/animations.service';
import { RatingComponent } from '../../../shared/components/rating/rating.component';
import { ComunicatorService } from '../../../core/services/comunicator/comunicator.service';
import { fade } from '../../../shared/animations/animations';
import { getKeyTrailer } from '../../../shared/utils/helpers';
import { MinutesToTimePipe } from '../../../shared/pipes/minutes-to-time.pipe';
import { BannerSkeletonComponent } from './banner-skeleton/banner-skeleton.component';
import { PlayerTrailer } from '../../../core/interfaces/shared/player.interface';
import { MovieList, Movie } from '../../../core/interfaces/movie/movie.interface';
register()

@Component({
  selector: 'app-banner',
  imports: [DatePipe, NgOptimizedImage, RouterLink, NgClass, RatingComponent, 
    MinutesToTimePipe,BannerSkeletonComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [fade]
})

export default class BannerComponent {

  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>
  onPlayTrailer = output<PlayerTrailer>()
  animationsService = inject(AnimationsService)
  indexCurrentElement: number = 0
  listMovies = input.required<WritableSignal<MovieList | undefined>>()
  movie: WritableSignal<Movie | undefined> = signal(undefined)
  isBeginning = signal(true)
  isEnd = signal(false)
  isLoading: WritableSignal<boolean> = signal(false)
  requestMoreData = output<void>()
  isSwiperHover=false
  private paginationObserver?: MutationObserver;
  private shadowChildObserver?: MutationObserver;

 
  constructor(@Inject(DOCUMENT) private document: Document, public comunicatorService: ComunicatorService) {
    effect(() => {
      this.movie.set(this.listMovies()()?.results[this.indexCurrentElement])
      this.isLoading.set(false)
      this.isEnd.set(false)
      queueMicrotask(() => {
        this.swiperContainer.nativeElement.swiper.update()
      })
    })

    effect(() => {
      console.log(this.movie())
      const trailerKey = getKeyTrailer(this.indexCurrentElement, this.listMovies()())
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
      this.movie.set(this.listMovies()()?.results[this.indexCurrentElement])


      this.loadMoreData()
      this.animateElements()
    })
  }
  loadMoreData() {
    console.log('indeexx', this.indexCurrentElement)
    let page = this.listMovies()()?.page ?? 0;
    let total_pages = this.listMovies()()?.total_pages ?? 0;
    if (this.isEnd() && (page < total_pages)) {
      this.isLoading.set(true)
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
    const rating = this.document.getElementById('rating')
    const overview = this.document.getElementById('overview')
    const genres = this.document.getElementById('genres')
    const release = this.document.getElementById('release')
    const buttons = this.document.getElementById('buttons')

    let playerTitle = this.animationsService.moveX('400ms', '400ms', '-150%', '0').create(title)
    playerTitle.play()

    let playerRating = this.animationsService.moveX('400ms', '400ms', '-150%', '0').create(release)
    playerRating.play()

    let playerGenres = this.animationsService.moveX('400ms', '400ms', '-150%', '0').create(genres)
    playerGenres.play()

    let playerOverview = this.animationsService.moveY('400ms', '700ms', '100%', '0').create(overview)
    playerOverview.play()

    let playerButtons = this.animationsService.moveY('200ms', '1s', '3%', '0').create(buttons)
    playerButtons.play()
  }

  playTrailer() {
    const trailerKey = getKeyTrailer(this.indexCurrentElement, this.listMovies()())
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






