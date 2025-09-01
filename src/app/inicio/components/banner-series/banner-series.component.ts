import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, inject, input, output, signal, ViewChild, WritableSignal } from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle';
import { listMovies, listSeries, playerTrailer, Serie } from '../../../shared/interfaces/interfaces';
import { AnimationsService } from '../../../shared/services/animations/animations.service';
import { ComunicatorService } from '../../../shared/services/comunicator/comunicator.service';
import { SwiperOptions } from 'swiper/types';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { RatingComponent } from '../../../shared/components/rating/rating.component';
import { RouterLink } from '@angular/router';
import { SkeletonComponent } from './skeleton/skeleton.component';

@Component({
  selector: 'app-banner-series',
  imports: [NgOptimizedImage, DatePipe, RatingComponent, RouterLink,SkeletonComponent],
  templateUrl: './banner-series.component.html',
  styleUrl: './banner-series.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BannerSeriesComponent {

  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>
  onPlayTrailer = output<playerTrailer>()
  animationsService = inject(AnimationsService)
  indexCurrentElement = signal(0)
  index = 0
  previousIndex = signal(0)
  nextIndex = signal(1)
  listSeries = input.required<WritableSignal<listSeries | undefined>>()
  serie: WritableSignal<Serie | undefined> = signal(undefined)
  isSwiperRegistered = false
  isBeginning = signal(true)
  isEnd = signal(false)
  isLoading: WritableSignal<boolean> = signal(false)
  requestMoreData = output<void>()
  dataSize = 0
  isSwiperHover=false

  constructor(public comunicatorService: ComunicatorService) {
    if (!this.isSwiperRegistered) {
      register(); // Registra Swiper solo una vez
      this.isSwiperRegistered = true;
    }

    effect(() => {
      this.dataSize = this.listSeries()()?.results.length ?? 0
      this.serie.set(this.listSeries()()?.results[this.index])
      this.isLoading.set(false)
      this.isEnd.set(false)
      queueMicrotask(() => {
        this.swiperContainer.nativeElement.swiper.update()
      })
    })

  }

  ngAfterViewInit() {
    this.initSwiper()
  }

  initSwiper() {
    const swiperOptions: SwiperOptions = {
      speed: 300,
      direction: 'vertical',
      slidesPerView: 5,
      slidesPerGroup: 1,
      allowTouchMove: false,
      observeParents: true,
      observer: true,
      centeredSlides: true,
      navigation: {
        prevEl: '.swiper-previous-serie',
        nextEl: '.swiper-next-serie',

      },
    }
    this.swiperContainer.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      console.log('pasando cambnoio banner series')
      console.log(event.detail[0].slides.length)
      console.log(this.listSeries())
      this.index = event.detail[0].activeIndex
      this.indexCurrentElement.set(event.detail[0].activeIndex)
      this.previousIndex.set(event.detail[0].activeIndex - 1)
      this.nextIndex.set(event.detail[0].activeIndex + 1)
      this.serie.set(this.listSeries()()?.results[event.detail[0].activeIndex])
      this.isBeginning.set(event.detail[0].isBeginning)
      this.isEnd.set(event.detail[0].isEnd)
      /* if (event.detail[0].realIndex == 0) {
        this.previousIndex.set(event.detail[0].slides.length - 1)
      }
      if (event.detail[0].activeIndex == event.detail[0].slides.length - 1) {
        this.nextIndex.set(0)
      } */
      this.loadMoreData()
      console.log(event.detail[0])
    })


    if (this.swiperContainer) {
      Object.assign(this.swiperContainer.nativeElement, swiperOptions)
      this.swiperContainer.nativeElement?.initialize()
    }

  }

  loadMoreData() {
    console.log('indeexx', this.indexCurrentElement, this.isEnd())
    let page = this.listSeries()()?.page ?? 0;
    let total_pages = this.listSeries()()?.total_pages ?? 0;
    console.log(this.dataSize - 2)

    if (this.indexCurrentElement() > (this.dataSize - 3) && (page < total_pages)) {
      this.isLoading.set(true)
      this.requestMoreData.emit()
    }
  }

}
