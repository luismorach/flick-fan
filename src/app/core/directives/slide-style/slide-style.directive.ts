import { Directive, computed, input } from '@angular/core';
import { SerieList } from '../../interfaces/serie/serie.interface';
import { CarouselService } from '../../services/carousel/carousel-service';

@Directive({
  selector: '[appSlideStyle]',
  standalone: true,
  host: { '[class]': 'slideClasses()' }
})
export class SlideStyleDirective {
  readonly index = input.required<number>();
  readonly carousel = input.required<CarouselService<SerieList,'results'>>()
  readonly direction = computed(()=>this.carousel().slidesInfo.direction())

  slideClasses = computed(() => {
    const index = this.index();
    const active = this.carousel().state().activeIndex();
    const slidesPerView = this.carousel().slidesInfo.layout().slidesPerView
    const diff = index - active;
    const lastIndex = active + (slidesPerView - 1)

    return [
      diff === 0 ? 'is-active' : '',
      Math.abs(diff) === 1 ? 'is-near' : '',
      Math.abs(diff) === 2 ? 'is-far' : '',
      diff === -2 ? `prev-${this.direction()}` : '',
      diff === 2 ? `next-${this.direction()}` : '',
      index === lastIndex ? 'is-last' : ''
    ].filter(Boolean).join(' ');
  });
}