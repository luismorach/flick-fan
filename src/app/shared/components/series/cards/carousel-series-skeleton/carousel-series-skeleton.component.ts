import { Component, computed, effect, ElementRef, input, signal, untracked, viewChild } from '@angular/core';
import { slidesConfig } from '../../../../../core/interfaces/shared/carousel-interface';
import { CdkDragPlaceholder } from "@angular/cdk/drag-drop";
import { NgTemplateOutlet } from '@angular/common';
import { useSlidesInfo } from '../../../../../core/services/carousel/util/use-slides-info';
import { CarouselService } from '../../../../../core/services/carousel/carousel-service';

@Component({
  selector: 'app-carousel-series-skeleton',
  templateUrl: './carousel-series-skeleton.component.html',
  styleUrl: './carousel-series-skeleton.component.css',
  imports: [NgTemplateOutlet]
})
export class CarouselSeriesSkeletonComponent {
  hasHeader = input<boolean>(true)
  readonly carouselService = input<CarouselService<any, any>>()
  slidesConfig = input<slidesConfig | undefined>(undefined);

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
    return this.carouselService() ? [1] : this.slidesInfo().skeletonSlideIndexes()
  })

  readonly peek = computed(() => {
    if (this.carouselService()) return 0;
    return this.slidesInfo().layout().peekSize;
  });
}
