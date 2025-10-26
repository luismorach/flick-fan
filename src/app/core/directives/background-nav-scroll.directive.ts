// src/app/shared/directives/background-nav-scroll.directive.ts
import { Directive, HostListener, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ComunicatorService } from '../services/comunicator/comunicator.service';
import { DOCUMENT } from '@angular/common';
import { take } from 'rxjs';

@Directive({
  selector: '[appBackgroundNavScroll]',
  standalone: true,
})
export class BackgroundNavScrollDirective implements OnDestroy, OnInit {

  private readonly comunicatorService = inject(ComunicatorService);
  private readonly ngZone = inject(NgZone);
  private readonly doc = inject(DOCUMENT);
  private readonly SCROLL_THRESHOLD = 20; // px
  private readonly THROTTLE_TIME = 16; // ~60fps
  private throttleTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.comunicatorService.setBackgroundNav(false);
    this.scrollToTop();
  }

  ngOnDestroy(): void {
    if (this.throttleTimer !== null) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
    this.comunicatorService.setBackgroundNav(false);
  }
   /**
   * Smoothly scrolls to the top of the page
   * Must be called from an Angular injection context
   */
  private scrollToTop(): void {
    this.ngZone.onStable.pipe(take(1)).subscribe(() => {
      const el = this.doc.scrollingElement || this.doc.documentElement || this.doc.body;
      if ('scrollTo' in el) {
        (el as HTMLElement).scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.throttleTimer !== null) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.throttleTimer = setTimeout(() => {
        this.ngZone.run(() => {
          const offset = window.scrollY || 0;
          this.comunicatorService.setBackgroundNav(offset > this.SCROLL_THRESHOLD);
        });
        this.throttleTimer = null;
      }, this.THROTTLE_TIME);
    });
  }
}
