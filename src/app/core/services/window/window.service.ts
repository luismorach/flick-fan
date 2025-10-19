import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class WindowService {
  private readonly windowWidth = signal(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  readonly width = this.windowWidth.asReadonly();
  readonly isMobile = computed(() => this.width() < 768);
  readonly isTablet = computed(() => this.width() >= 768 && this.width() < 1024);
  readonly isDesktop = computed(() => this.width() >= 1024);

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
