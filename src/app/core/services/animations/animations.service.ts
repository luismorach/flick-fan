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
  private readonly animationBuilder = inject(AnimationBuilder)

  moveX(config: AnimationConfig): AnimationFactory {
    const timing = this.buildTiming(config);
    return this.animationBuilder.build([
      style({ transform: `translateX(${config.startPosition})` }),
      animate(timing, style({ transform: `translateX(${config.endPosition})` }))
    ])
  }

  moveY(config: AnimationConfig): AnimationFactory {
    const timing = this.buildTiming(config);
    return this.animationBuilder.build([
      style({ transform: `translateY(${config.startPosition})`, opacity: 0 }),
      animate(timing, style({ transform: `translateY(${config.endPosition})`, opacity: 1 }))
    ])
  }

  changeX(config: AnimationConfig): AnimationFactory {
    const timing = this.buildTiming(config);
    return this.animationBuilder.build([
      style({ left: config.startPosition }),
      animate(timing, style({ left: config.endPosition }))
    ])
  }
  changeY(config: AnimationConfig): AnimationFactory {
    const timing = this.buildTiming(config);
    return this.animationBuilder.build([
      style({ top: config.startPosition }),
      animate(timing, style({ top: config.endPosition }))
    ])
  }

  changeSize(config: SizeAnimationConfig): AnimationFactory {
    const timing = this.buildTiming(config);
    return this.animationBuilder.build([
      style({ width: config.startWidth, height: config.startHeight }),
      animate(timing, style({ width: config.endWidth, height: config.endHeight }))
    ])
  }

  private buildTiming(config: AnimationConfig | SizeAnimationConfig): string {
    const { duration, delay = '0ms', easing = 'ease' } = config;
    return `${duration} ${delay} ${easing}`;
  }
}
