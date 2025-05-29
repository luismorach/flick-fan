import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, inject, input, output, signal, ViewChild, WritableSignal } from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle';
import { listMovies, listSeries, playerTrailer, Serie } from '../../../shared/interfaces/interfaces';
import { AnimationsService } from '../../../shared/services/animations/animations.service';
import { ComunicatorService } from '../../../shared/services/comunicator/comunicator.service';
import { SwiperOptions } from 'swiper/types';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { RatingComponent } from '../../../shared/components/rating/rating.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-banner-series',
  imports: [NgOptimizedImage, DatePipe,RatingComponent,RouterLink],
  templateUrl: './banner-series.component.html',
  styleUrl: './banner-series.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BannerSeriesComponent {

  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>
  onPlayTrailer = output<playerTrailer>()
  animationsService = inject(AnimationsService)
  indexCurrentElement = signal(0)
  previousIndex = signal(0)
  nextIndex = signal(0)
  listSeries = input.required<listSeries | undefined>()
  serie: WritableSignal<Serie| undefined> = signal(undefined)
  isSwiperRegistered = false

  constructor(public comunicatorService: ComunicatorService) {
    if (!this.isSwiperRegistered) {
      register(); // Registra Swiper solo una vez
      this.isSwiperRegistered = true;
    }

    effect(() => {
      
      this.serie.set(this.listSeries()?.results[this.indexCurrentElement()])
    })
  }

  ngAfterViewInit() {
    this.initSwiper()
  }

  initSwiper() {
    const swiperOptions: SwiperOptions = {
      speed: 800,
      direction: 'vertical',
      slidesPerView: 5,
      slidesPerGroup: 1,
      allowTouchMove: false,
      observeParents: true,
      observer: true,
      centeredSlides: true,
      loop: true,
      initialSlide: this.indexCurrentElement(),
      navigation: {
        enabled: true,
         nextEl: '.swiper-next-serie',
         prevEl: '.swiper-previous-serie' 
      },
    }
    this.swiperContainer.nativeElement.addEventListener('swiperslidechange', (event: any) => {
      console.log('cambio')
      console.log(event.detail[0].slides.length)
      console.log(this.listSeries())
      this.indexCurrentElement.set(event.detail[0].realIndex)
      this.previousIndex.set(event.detail[0].realIndex - 1)
      this.nextIndex.set(event.detail[0].realIndex + 1)
      this.serie.set(this.listSeries()?.results[event.detail[0].realIndex])
      if (event.detail[0].realIndex == 0) {
        this.previousIndex.set(event.detail[0].slides.length - 1)
      }
      if (event.detail[0].realIndex == event.detail[0].slides.length - 1) {
        this.nextIndex.set(0)
      }
    })


    if (this.swiperContainer) {
      Object.assign(this.swiperContainer.nativeElement, swiperOptions)
      this.swiperContainer.nativeElement?.initialize()
    }

  }

}
