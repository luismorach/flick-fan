import { AnimationBuilder, AnimationFactory, animate, style } from '@angular/animations';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AnimationsService {
  builderAnimation = inject(AnimationBuilder)

  moveX(duration: string, delay: string, start: string, end: string): AnimationFactory {
    return this.builderAnimation.build([
      style({ transform: `translateX(${start})` }),
      animate(duration + ' ' + delay + ' ease', style({ transform: `translateX(${end})` }))
    ])
  }

  moveY(duration: string, delay: string, start: string, end: string): AnimationFactory {
    return this.builderAnimation.build([
      style({ transform: `translateY(${start})`, opacity: '0' }),
      animate(duration + ' ' + delay + ' ease', style({ transform: `translateY(${end})`, opacity: '1' }))
    ])
  }
  
  changeX(duration: string, delay: string, start: string, end: string): AnimationFactory {
    return this.builderAnimation.build([
      animate(duration + ' ' + ' ease', style({ left: start })),
      animate(duration + ' ' + delay + ' ease', style({ left: end }))
    ])
  }
  changeY(duration: string, delay: string, start: string, end: string): AnimationFactory {
    return this.builderAnimation.build([
      animate(duration + ' ' + ' ease', style({ top: start })),
      animate(duration + ' ' + delay + ' ease', style({ top: end }))
    ])
  }

  changeSize(duration: string, delay: string, startWidth: string, startHeight: string,
    endWidth: string, endHeight: string) {
    return this.builderAnimation.build([
       animate(duration + ' ' + ' ease', style({ width: startWidth, height: startHeight })),
      animate(duration + ' ' + delay + ' ease', style({ width: endWidth, height: endHeight }))
    ])
  }
}
