import { Directive, ElementRef, Renderer2, computed, effect, inject, input } from '@angular/core';
import { SerieList } from '../../interfaces/serie/serie.interface';
import { CarouselService } from '../../services/test/carousel/carousel-service';

@Directive({
  selector: '[appSlideStyle]',
  standalone: true,
})
export class SlideStyleDirective {
  readonly index = input.required<number>();
  readonly carousel = input.required<CarouselService<SerieList, 'results'>>()
  readonly direction = computed(() => this.carousel().state().slidesInfo.direction())
  renderer = inject(Renderer2)
  private readonly element: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;

  constructor() {
    effect(() => {
      const progress = this.carousel().state().scrollProgress();
      this.updateTransform(progress)
    });
  }


  private updateTransform(progress: number) {

    const slideProgress = this.index() - progress;
    const distance = Math.abs(slideProgress);
    const visibleRange = Math.ceil(this.carousel().state().slidesInfo.layout().slidesPerView / 2) + 2;
    if (distance > visibleRange) {
      this.resetTransform();
      return;
    }
     // console.log('aplicando cambios de scalado', this.index())


    //const scale = Math.max(1, 2 - distance * 0.5);
    const scale = 1 + Math.pow(Math.max(0, 1 - distance / 2), 2);

    const zIndex = Math.max(0, 20 - Math.round(distance * 5));

    const translate = Math.min(
      Math.max(distance - 1, 0),
      1
    ) * (scale - 1) * 50;


    const signedTranslate = Math.sign(slideProgress) * translate;

    const vertical = this.direction() === 'vertical';

    this.element.style.transform = vertical
        ? `scale(${scale}) translateY(${signedTranslate}%)`
        : `scale(${scale}) translateX(${signedTranslate}%)`

      this.element.style.zIndex=String(zIndex)
    /* this.renderer.setStyle(
      this.element,
      'transform',
      vertical
        ? `scale(${scale}) translateY(${signedTranslate}%)`
        : `scale(${scale}) translateX(${signedTranslate}%)`
    ); */

    //this.renderer.setStyle(this.element, 'z-index', String(zIndex));
  }

  private resetTransform() {
    this.renderer.removeStyle(this.element, 'transform');
    this.renderer.removeStyle(this.element, 'z-index');
  }
  /* slideClasses = computed(() => {
    const index = this.index();
    const active = this.carousel().state().activeIndex?.();
    const slidesPerView = this.carousel().state().slidesInfo.layout().slidesPerView
    console.log('active in appslide',active)
    if (active===undefined) return ''
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
  }); */
}