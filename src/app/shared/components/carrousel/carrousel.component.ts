import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Host, HostListener, inject, Input, input, ViewChild } from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle'
import { AllMovies } from '../../interfaces/interfaces';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { SwiperOptions } from 'swiper/types';
import { ComunicatorService } from '../../services/comunicator/comunicator.service';
register()
@Component({
  selector: 'app-carrousel',
  imports: [NgOptimizedImage, DatePipe],
  templateUrl: './carrousel.component.html',
  styleUrl: './carrousel.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class carrouselComponent {
  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>
  movies=input.required<AllMovies | undefined>()
  title=input.required<string>()

  constructor(private comunicatorService: ComunicatorService) { }

  @HostListener("window:scroll", ['$event'])
  enableBackgroundNav(event: any) {
    let offset = event.srcElement.children[0].scrollTop
    if (offset > 20) {
      this.comunicatorService.setBackgroundNav(true)
    } else {
      this.comunicatorService.setBackgroundNav(false)
    }
  }

  ngAfterViewInit() {
    this.initSwiper()
  }

  initSwiper() {
    const swiperOptions: SwiperOptions = {
      speed: 800,
      slidesPerView: 4,
      allowTouchMove: false,
      spaceBetween: 5,
      slidesPerGroup: 4,
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
