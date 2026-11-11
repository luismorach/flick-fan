import { Component, computed, effect, ElementRef, Input, input, signal, untracked, viewChild } from '@angular/core';
import { fade } from '../../../../animations/animations';

import { slidesConfig } from '../../../../../core/interfaces/shared/carousel-interface';
import { NgTemplateOutlet } from '@angular/common';
import { useResizeObserver } from '../../../../../core/services/carousel/util/use-resize-observer';
import { useSlidesInfo } from '../../../../../core/services/carousel/util/use-slides-info';
import { CarouselService } from '../../../../../core/services/carousel/carousel-service';

@Component({
  selector: 'app-carousel-movies-skeleton',
  templateUrl: './carousel-movies-skeleton.component.html',
  styleUrl: './carousel-movies-skeleton.component.css',
  animations: [fade],
  imports: [NgTemplateOutlet]
})
export class CarouselMoviesSkeletonComponent {
  readonly hasHeader = input<boolean>(true)
  readonly slidesConfig = input<slidesConfig | undefined>(undefined);
  readonly carouselService = input<CarouselService<any, any>>()

  private readonly skeletonsContainer = viewChild<ElementRef<HTMLElement>>('container')
  protected slidesInfo = signal(useSlidesInfo(undefined, {}))

  initSlidesInfo = effect(() => {
    const container = this.skeletonsContainer()
    const config = this.slidesConfig()

    if (!container || !config) return
    untracked(() => {
      this.slidesInfo.set(useSlidesInfo(container, config))
    })
  })

  readonly skeletons = computed(() => {
    return this.carouselService() ? [1] : this.slidesInfo()?.skeletonSlideIndexes()
  })

  readonly peek = computed(() => {
    if (this.carouselService()) return 0;
    return this.slidesInfo()?.layout().peekSize + this.slidesInfo().layout().slidesOffsetBefore;
  });
}