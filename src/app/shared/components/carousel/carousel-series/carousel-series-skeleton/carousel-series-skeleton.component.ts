import { Component, computed, effect, ElementRef, input, signal, viewChild } from '@angular/core';
import { slidesConfig } from '../../../../../core/interfaces/shared/carousel-interface';
import { CdkDragPlaceholder } from "@angular/cdk/drag-drop";
import { NgTemplateOutlet } from '@angular/common';
import { useSlidesInfo } from '../../../../../core/services/test/util/use-slides-info';

@Component({
  selector: 'app-carousel-series-skeleton',
  templateUrl: './carousel-series-skeleton.component.html',
  styleUrl: './carousel-series-skeleton.component.css',
  imports: [NgTemplateOutlet]
})
export class CarouselSeriesSkeletonComponent {
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
    return this.insideCarousel() ? [1] : this.slidesInfo().skeletonSlideIndexes()
  })

  readonly peek = computed(() => {
    if (this.insideCarousel()) return 0;
    return this.slidesInfo().layout().peekSize;
  });
}
