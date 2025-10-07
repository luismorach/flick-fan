import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, Inject, input, output, signal, ViewChild, WritableSignal } from '@angular/core';
import { MovieList, Movie } from '../../../../core/interfaces/movie/movie.interface';
import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { ComunicatorService } from '../../../../core/services/comunicator/comunicator.service';
import { getKeyTrailer } from '../../../utils/helpers';
import { register, SwiperContainer } from 'swiper/element/bundle';
import { BannerSkeletonComponent } from '../banner-skeleton/banner-skeleton.component';
import { SwiperOptions } from 'swiper/types';
register()

@Component({
  selector: 'app-movie-swiper',
  imports: [BannerSkeletonComponent,NgOptimizedImage],
  templateUrl: './movie-swiper.component.html',
  styleUrl: './movie-swiper.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MovieSwiperComponent {  
  indexCurrentElement: number = 0
  movieList = input.required<WritableSignal<MovieList | undefined>>()
  movie: WritableSignal<Movie | undefined> = signal(undefined)
  isBeginning = signal(true)
  isEnd = signal(false)
  isLoading: WritableSignal<boolean> = signal(false)
  requestMoreData = output<void>()
  private paginationObserver?: MutationObserver;
  private shadowChildObserver?: MutationObserver;
  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>

  constructor(@Inject(DOCUMENT) private document: Document, public comunicatorService: ComunicatorService) {
    effect(() => {
      this.movie.set(this.movieList()()?.results[this.indexCurrentElement])
      this.isLoading.set(false)
      this.isEnd.set(false)
      queueMicrotask(() => {
        this.swiperContainer.nativeElement.swiper.update()
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
  
        this.loadMoreData()
        //this.animateElements()
      })
    }
    loadMoreData() {
      console.log('indeexx', this.indexCurrentElement)
      let page = this.movieList()()?.page ?? 0;
      let total_pages = this.movieList()()?.total_pages ?? 0;
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
  

}
