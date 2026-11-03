import { Component, computed, input } from '@angular/core';
import { Serie } from '../../../../../core/interfaces/serie/serie.interface';
import { NgOptimizedImage } from '@angular/common';
import { CarouselService } from '../../../../../core/services/test/carousel/carousel-service';

@Component({
  selector: 'app-slide',
  imports: [NgOptimizedImage],
  templateUrl: './slide.component.html',
  styleUrl: './slide.component.css'
})
export class SlideComponent {
  readonly serie = input.required<Serie>()
  readonly index = input.required<number>()
  readonly carouselService = input.required<CarouselService<any, any>>()

  readonly slideHeight = computed(() => {
    if (this.carouselService().state().slidesInfo.direction() === 'vertical')
      return `${this.carouselService().state().slidesInfo.layout().slideMainAxisSize}px`

    return `auto`
  })

  readonly slideWidth = computed(() => {
    if (this.carouselService().state().slidesInfo.direction() === 'horizontal')
      return `${this.carouselService().state().slidesInfo.layout().slideMainAxisSize}px`

    return `auto`
  })

  readonly isVertical = computed(() => this.carouselService().state().slidesInfo.direction() === 'vertical')
}
