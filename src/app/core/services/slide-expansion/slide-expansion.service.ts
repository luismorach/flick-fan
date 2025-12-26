import { inject, Injectable } from '@angular/core';
import { SkeletonSlidesHook } from '../../../shared/utils/use-skeleton-slides';
import { WindowService } from '../window/window.service';

@Injectable()
export class SlideExpansionService {

  private container!: HTMLElement
  private slidesInfo !: SkeletonSlidesHook
  private currentPosition !: number
  private slideExpandedWidth = 0
  private shouldResetTranslate = false

  /**
  * Adjusts translate when a slide expands.
  * Prevents the expanded slide from being cut off in the viewport.
  * @param index - Index of the slide to expand
  */
  adjustTranslateForExpandedSlide(slide: HTMLElement, slidesInfo: SkeletonSlidesHook, currentPosition: number): void {
    const container = slide.parentElement as HTMLElement ?? undefined
    if (!container) return

    this.container = container
    this.slidesInfo = slidesInfo
    this.currentPosition = currentPosition
    
    this.slideExpandedWidth = slide.offsetLeft + this.slidesInfo.expandedSlideWidth() + this.slidesInfo.spaceBetween()

    console.log('offsetleft',slide.offsetLeft,'slidewidthfull',this.slideExpandedWidth, container.offsetWidth)
    if (this.needsTranslateAdjustment()) {
      this.applyTranslateAdjustment();
    }
  }

  private needsTranslateAdjustment(): boolean {
    const viewportWidth = this.container.offsetWidth;
    return (this.slideExpandedWidth - this.currentPosition) > viewportWidth;
  }

  private applyTranslateAdjustment(): void {
    const viewportWidth = this.container.offsetWidth;
    const newTranslate = this.slideExpandedWidth - viewportWidth;
    console.log(viewportWidth,this.slideExpandedWidth,newTranslate,this.currentPosition)
    this.container.scrollTo({ left: newTranslate, behavior: 'smooth' })
    console.log('currentposition',this.container.scrollLeft)
    this.shouldResetTranslate = true;
  }

  /**
   * Restores base translate position after collapsing a slide
   */
  restoreBaseTranslate(): void {
    if (!this.shouldResetTranslate) return
    this.container.scrollTo({ left: this.currentPosition, behavior: 'smooth' })
    this.shouldResetTranslate = false
  }

}
