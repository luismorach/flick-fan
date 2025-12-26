import {
  ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA,ElementRef, inject, input, viewChild,
} from '@angular/core';
import { fade } from '../../../animations/animations';
import { CardSerieComponent } from './card-serie/card-serie.component';
import { Serie, SerieList } from '../../../../core/interfaces/serie/serie.interface';
import { SkeletonSlidesHook, useSkeletonSlides } from '../../../utils/use-skeleton-slides';
import { CarouselSeriesSkeletonComponent } from './carousel-series-skeleton/carousel-series-skeleton.component';
import { CarouselNavigationComponent } from '../carousel-navigation/carousel-navigation.component';
import { DataLoaderManager } from '../../../utils/data-loader-manager';
import { CarouselService } from '../../../../core/services/carousel/carousel.service';
import { SlideExpansionService } from '../../../../core/services/slide-expansion/slide-expansion.service';
import { IntersectionObserverManager } from '../../../utils/intersectionObserver';

@Component({
  selector: 'app-carousel-series',
  imports: [CardSerieComponent, CarouselSeriesSkeletonComponent, CarouselNavigationComponent],
  providers: [DataLoaderManager, CarouselService, SlideExpansionService,IntersectionObserverManager],
  templateUrl: './carousel-series.component.html',
  styleUrl: './carousel-series.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CarouselSeriesComponent {

  // Inputs
  readonly seriesList = input.required<SerieList | undefined>();
  readonly title = input.required<string>();
  readonly slideExpansionService = inject(SlideExpansionService)

  // Dependencies
  readonly carouselService = inject(CarouselService<Serie>)

  // Configuration
  private static readonly SLIDE_WIDTH = 288;

  readonly slidesInfo: SkeletonSlidesHook = useSkeletonSlides(
    CarouselSeriesComponent.SLIDE_WIDTH,
    true
  );

  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carousel')

  constructor() {
    this.carouselService.initialize(this.carouselContainer, this.seriesList, {slidesInfo:this.slidesInfo})
  }

  onSlideExpandHover(index: number) {
    const slide = this.carouselContainer()?.nativeElement.children[index] as HTMLElement 
    if(!slide)return

    this.slideExpansionService.adjustTranslateForExpandedSlide(slide, this.slidesInfo, this.carouselService.currentPosition())
  }

  onSlideCollapseHover() {
    this.slideExpansionService.restoreBaseTranslate()
  }

}
