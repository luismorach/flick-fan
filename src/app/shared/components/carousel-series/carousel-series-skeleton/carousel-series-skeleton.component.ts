import { Component, computed, input} from '@angular/core';
import { SkeletonSlidesHook } from '../../../utils/use-skeleton-slides';

@Component({
  selector: 'app-carousel-series-skeleton',
  templateUrl: './carousel-series-skeleton.component.html',
  styleUrl: './carousel-series-skeleton.component.css'
})
export class CarouselSeriesSkeletonComponent {
  hasHeader = input<boolean>(true)
  insideCarousel = input<boolean>(false)
  slides = input.required<SkeletonSlidesHook>()

  readonly padding = computed(() => {
    if (this.insideCarousel()) return 0;
    return this.slides().paddingX() + this.slides().spaceBetween();
  });
}
