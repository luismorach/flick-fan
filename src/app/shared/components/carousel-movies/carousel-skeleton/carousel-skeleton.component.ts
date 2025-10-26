import { Component, computed,input} from '@angular/core';
import { CardMovieSkeletonComponent } from '../card-movie-skeleton/card-movie-skeleton.component';
import { SkeletonSlidesHook} from '../../../utils/use-skeleton-slides';
import { fade } from '../../../animations/animations';

@Component({
  selector: 'app-carousel-skeleton',
  imports: [CardMovieSkeletonComponent],
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
    return this.slides().paddingX() + this.slides().spaceBetween();
  });

}