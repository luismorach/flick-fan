// src/app/shared/directives/background-nav-scroll.directive.ts
import { Directive, HostListener, inject, OnDestroy } from '@angular/core';
import { ComunicatorService } from '../services/comunicator/comunicator.service';

@Directive({
  selector: '[appBackgroundNavScroll]',
  standalone: true,
})
export class BackgroundNavScrollDirective implements OnDestroy {

  private readonly comunicatorService = inject(ComunicatorService);
  private readonly SCROLL_THRESHOLD = 20; // px
  private readonly THROTTLE_TIME = 16; // ~60fps

  private throttleTimer: number | null = null;

  constructor() {
    this.comunicatorService.setBackgroundNav(false);
  }

  ngOnDestroy(): void {
    if (this.throttleTimer !== null) {
      clearTimeout(this.throttleTimer);
    }
    this.comunicatorService.setBackgroundNav(false);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.throttleTimer !== null) {
      return;
    }

    this.throttleTimer = window.setTimeout(() => {
      const offset = window.scrollY || 0;
      this.comunicatorService.setBackgroundNav(offset > this.SCROLL_THRESHOLD);
      this.throttleTimer = null;
    }, this.THROTTLE_TIME);
  }
}
