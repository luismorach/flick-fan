import { Component, computed, input } from '@angular/core';
import { CarouselService } from '../../../../../core/services/carousel/carousel-service';

@Component({
  selector: 'app-banner-skeleton',
  imports: [],
  templateUrl: './banner-skeleton.component.html',
  styleUrl: './banner-skeleton.component.css'
})
export class BannerSkeletonComponent {
  readonly carouselService = input<CarouselService<any, any>>()
  width = computed(() => {
    const carouselService = this.carouselService()
    if (!carouselService) return '100%';
    return `${carouselService.state().slidesInfo.layout().slideMainAxisSize}px`;
  })
}
