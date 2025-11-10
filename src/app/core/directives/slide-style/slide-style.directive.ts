import { Directive, computed, input } from '@angular/core';

@Directive({
  selector: '[appSlideStyle]',
  standalone: true,
  host: { '[class]': 'slideClasses()' }
})
export class SlideStyleDirective {
  readonly index = input.required<number>();
  readonly active = input.required<number>();

  slideClasses = computed(() => {
    const i = this.index(), a = this.active();
    const diff = i - a;

    return [
      'slide',
      diff === 0 ? 'scale-[2] z-40' : '',
      Math.abs(diff) === 1 ? 'scale-150 z-30' : '',
      diff === -2 ? 'translate-y-[40%]' : '',
      diff ===  2 ? '-translate-y-[40%]' : ''
    ].filter(Boolean).join(' ');
  });
}