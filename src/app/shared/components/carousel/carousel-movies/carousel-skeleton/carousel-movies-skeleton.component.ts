import { Component, computed, effect, ElementRef, input, viewChild } from '@angular/core';
import { fade } from '../../../../animations/animations';
import { SlidesInfoHook, useSlidesInfo } from '../../../../utils/use-slides-info';
import { slidesConfig } from '../../../../../core/interfaces/shared/carousel-interface';
import { CdkDragPlaceholder } from "@angular/cdk/drag-drop";
import { NgTemplateOutlet } from '@angular/common';

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

  private readonly skeletonsContainer = viewChild<ElementRef<HTMLElement>>('container')

  private slidesConfig: slidesConfig = {
    slidesPerView: 1,
    peekSkeletonOffset: 1,
    peek: 24,
    spaceBetween: 24,
    breakpoints: {
      398: { slidesPerView: 1.5 },
      508: { slidesPerView: 2, },
      748: { slidesPerView: 3, peek: 32 },
      988: { slidesPerView: 4, peek: 44 },
      1388: { slidesPerView: 5 }
    }
  }

  slidesInfo = useSlidesInfo(this.skeletonsContainer, this.slidesConfig)

  readonly skeletons = computed(() => {
    return this.insideCarousel() ? [1] : this.slidesInfo?.skeletonSlideIndexes()
  })

  readonly peek = computed(() => {
    if (this.insideCarousel()) return 0;
    return this.slidesInfo?.layout().peekSize;
  });
}