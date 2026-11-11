import { Component, computed, input } from '@angular/core';
import { Serie } from '../../../../../../core/interfaces/serie/serie.interface';
import { CarouselService } from '../../../../../../core/services/carousel/carousel-service';

@Component({
  selector: 'app-slide-serie-skeleton',
  imports: [],
  templateUrl: './slide-skeleton.component.html',
  styleUrl: './slide-skeleton.component.css'
})
export class SlideSkeletonComponent {
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
