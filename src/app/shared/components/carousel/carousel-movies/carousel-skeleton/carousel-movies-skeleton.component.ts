import { Component, computed, effect, ElementRef, Input, input, signal, untracked, viewChild } from '@angular/core';
import { fade } from '../../../../animations/animations';

import { slidesConfig } from '../../../../../core/interfaces/shared/carousel-interface';
import { NgTemplateOutlet } from '@angular/common';
import { useResizeObserver } from '../../../../../core/services/test/util/use-resize-observer';
import { useSlidesInfo } from '../../../../../core/services/test/util/use-slides-info';
import { SlidesInfoHook } from '../../../../utils/use-slides-info';

@Component({
  selector: 'app-carousel-movies-skeleton',
  templateUrl: './carousel-movies-skeleton.component.html',
  styleUrl: './carousel-movies-skeleton.component.css',
  animations: [fade],
  imports: [NgTemplateOutlet]
})
export class CarouselMoviesSkeletonComponent {
  hasHeader = input<boolean>(true)
  insideCarousel = input<boolean>(false)
  slidesConfig = input<slidesConfig | undefined>(undefined);

  private readonly skeletonsContainer = viewChild<ElementRef<HTMLElement>>('container')
  protected slidesInfo = signal(useSlidesInfo(undefined, {}))

  initSlidesInfo = effect(() => {
    const container = this.skeletonsContainer()
    const config = this.slidesConfig()
    if (!container || !config) return
    this.slidesInfo.set(useSlidesInfo(container, config))
  })

  readonly skeletons = computed(() => {
    return this.insideCarousel() ? [1] : this.slidesInfo()?.skeletonSlideIndexes()
  })

  readonly peek = computed(() => {
    if (this.insideCarousel()) return 0;
    return this.slidesInfo()?.layout().peekSize + this.slidesInfo().layout().slidesOffsetBefore;
  });
}