import { DestroyRef, inject, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class WindowService {
  private readonly windowWidth = signal(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  readonly width = this.windowWidth.asReadonly();

  constructor() {
    if (typeof window !== 'undefined') {
      const handleResize = () => this.windowWidth.set(window.innerWidth);
      window.addEventListener('resize', handleResize);

      // Cleanup automático con DestroyRef (Angular 16+)
      inject(DestroyRef).onDestroy(() => {
        window.removeEventListener('resize', handleResize);
      });
    }
  }
}
