import { AnimationBuilder, AnimationFactory, animate, style } from '@angular/animations';
import { Injectable, inject } from '@angular/core';

export interface AnimationConfig {
  duration: string;
  delay?: string;
  easing?: string;
  startPosition: string;
  endPosition: string;
}

export interface SizeAnimationConfig {
  duration: string;
  delay?: string;
  easing?: string;
  startWidth: string;
  startHeight: string;
  endWidth: string;
  endHeight: string;
}

@Injectable({
  providedIn: 'root'
})

export class AnimationsService {
  private readonly builder = inject(AnimationBuilder);
  
  playAnimation(element: HTMLElement, initialState: any, timing: string) {
    const animation = this.builder.build([
      initialState,
      animate(timing, style({ opacity: 1, transform: 'translateX(0)' }))
    ]);

    const player = animation.create(element);
    player.play();
  }

  resetAnimations(elements: HTMLElement[]) {

    elements.forEach(el => {
      if (el) {
        el.style.animation = 'none';
        void el.offsetWidth; // force reflow
      }
    });
  }
}
