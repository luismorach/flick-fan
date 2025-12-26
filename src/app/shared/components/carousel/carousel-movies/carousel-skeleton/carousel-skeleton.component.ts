import { Component, computed,input} from '@angular/core';
import { fade } from '../../../../animations/animations';
import { SkeletonSlidesHook } from '../../../../utils/use-skeleton-slides';

@Component({
  selector: 'app-carousel-skeleton',
  templateUrl: './carousel-skeleton.component.html',
  styleUrl: './carousel-skeleton.component.css',
  animations: [fade]
})
export class CarouselSkeletonComponent {
  hasHeader = input<boolean>(true)
  insideCarousel = input<boolean>(false)
  slides = input.required<SkeletonSlidesHook>()

  readonly padding = computed(() => {
    if (this.insideCarousel()) return 0;
    return this.slides().fullSpacing()
  });

}