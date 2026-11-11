import { Directive, effect, ElementRef, inject, input, output, ViewChild } from '@angular/core';

@Directive({
  selector: '[appInView]'
})
export class InViewDirective {

  readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly root = input<HTMLElement | null>(null);
  readonly rootMargin = input('0px 0px 0px 0px');
  readonly inView = output<void>();
  private io !:IntersectionObserver;

  checkVisibility() {
    const element = this.el.nativeElement;

    this.io?.unobserve(element);
    this.io?.observe(element);
  }
  
  constructor() {
    effect((onCleanup) => {
      if (typeof IntersectionObserver === 'undefined') return; // SSR

      const ref = this.root()
      const root = document.querySelector('html') as HTMLElement | null;


      root?.addEventListener('scroll', () => {

        const e = event as Event & { isTrusted: boolean };

        console.log('SCROLL', {
          top: root?.scrollTop,
          trusted: e.isTrusted,
          time: performance.now()
        });
      });
      this.io = new IntersectionObserver(
        ([entry]) => {
          console.log('Antes de emitir:', {
            scrollTop: this.root()?.scrollTop,
            targetTop: entry.boundingClientRect.top,
            targetHeight: entry.boundingClientRect.height
          });
          const root = this.root();


          const before = {
            scrollTop: root?.scrollTop,
            rootoffsetTop: root?.offsetTop,
          };
          entry?.isIntersecting && this.inView.emit()


          console.log('BEFORE', before);

          console.log('AFTER', {
            scrollTop: root?.scrollTop,
            rootoffsetTop: root?.offsetTop,
          });
        },

        {
          root: this.root(),
          rootMargin: this.rootMargin(),
          threshold: 0
        },
      );
      this.io.observe(this.el.nativeElement);
      onCleanup(() => this.io.disconnect());
    });
  }

}
