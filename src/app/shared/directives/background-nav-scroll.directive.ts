// src/app/shared/directives/background-nav-scroll.directive.ts
import { Directive, HostListener } from '@angular/core';
import { ComunicatorService } from '../services/comunicator/comunicator.service';

@Directive({
  selector: '[appBackgroundNavScroll]',
  standalone: true,
})
export class BackgroundNavScrollDirective {
  constructor(private comunicatorService: ComunicatorService) {}

  @HostListener('window:scroll')
  onScroll() {
    const offset = window.scrollY || 0;
    this.comunicatorService.setBackgroundNav(offset > 20);
  }
}
