import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, ViewChild } from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle'
import { ApiService } from '../../../shared/services/API/api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { AllMovies } from '../../../shared/interfaces/interfaces';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { SwiperOptions } from 'swiper/types';
register()
@Component({
  selector: 'app-popular',
  imports: [NgOptimizedImage,DatePipe],
  templateUrl: './popular.component.html',
  styleUrl: './popular.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PopularComponent {
  api = inject(ApiService)
  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>
  popularMovies = toSignal(this.api.getPopular() as Observable<AllMovies>)

  ngAfterViewInit() {
    this.initSwiper()
  }

  initSwiper() {
    const swiperOptions: SwiperOptions = {
      speed: 800,
      slidesPerView: 4,
      allowTouchMove: false,
      spaceBetween: 5,
      pagination: {
        enabled: true,
        dynamicBullets: true
      },
      navigation: {
        enabled: true,
        /* nextEl: '.swiper-next',
        prevEl: '.swiper-previous' */
      },
    }
    /*  this.swiperContainer.nativeElement.addEventListener('swiperslidechange', (event: any) => {
       console.log(event.detail[0].activeIndex)
       this.indexCurrentElement = event.detail[0].activeIndex
       this.id_movie.set(this.allMovies()?.results[this.indexCurrentElement].id)
     }) */
    if (this.swiperContainer) {
      Object.assign(this.swiperContainer.nativeElement, swiperOptions)
      this.swiperContainer.nativeElement?.initialize()
    }

  }
}
