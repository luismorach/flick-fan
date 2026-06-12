import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, viewChild, viewChildren } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { SerieList, Serie } from '../../../../core/interfaces/serie/serie.interface';
import { CarouselNavigationComponent } from "../../carousel/carousel-navigation/carousel-navigation.component";
import { fade } from '../../../animations/animations';
import { SlideStyleDirective } from "../../../../core/directives/slide-style/slide-style.directive";
import { BannerDetailsComponent } from "./banner-details/banner-details.component";
import { CarouselOptions } from '../../../../core/interfaces/shared/carousel-interface';
import { CdkScrollable } from "@angular/cdk/scrolling";
import { CarouselService } from '../../../../core/services/carousel/carousel-service';
import { useDataLoader } from '../../../utils/data-loaders/use-data-loader';
import { hasPagination, withPagination } from '../../../utils/data-loaders/enhancers/with-pagination';
import { WithDetails } from '../../../utils/data-loaders/enhancers/with-details';
import { hasInfiniteScroll, withInfiniteScroll } from '../../../utils/data-loaders/enhancers/with-infinite-scroll';

@Component({
  selector: 'app-banner-series',
  imports: [
    NgOptimizedImage,
    SkeletonComponent,
    CarouselNavigationComponent,
    SlideStyleDirective,
    BannerDetailsComponent,
    CdkScrollable,
  ],
  providers: [CarouselService],
  templateUrl: './banner-series.component.html',
  styleUrl: './banner-series.component.css',
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class BannerSeriesComponent {

  // Input
  readonly listSeries = input.required<SerieList | undefined>()

  // Dependencies
  readonly carouselService = inject(CarouselService<SerieList, 'results'>);
  readonly loader = useDataLoader<SerieList, 'results'>('results', this.listSeries)
  .with(withInfiniteScroll)
  .with(WithDetails)
  .build();
  
  

  // View Queries
  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carousel')
  private readonly sentinels = viewChildren<ElementRef<HTMLElement>>('sentinels')

  //computed
  readonly spacingToCenter = computed(() => {
    if (this.carouselService.slidesInfo.direction() === 'vertical')
      return `${this.carouselService.slidesInfo.layout().spacingToCenterSlide}px 0px`

    return `0px ${this.carouselService.slidesInfo.layout().spacingToCenterSlide}px`
  })

  readonly viewportHeight = computed(() => {
    if (this.carouselService.slidesInfo.direction() === 'vertical') {
      const height = (this.carouselService.slidesInfo.layout().slideMainAxisSize) *
        this.carouselService.slidesInfo.layout().slidesPerView
      return `${height}px`
    }
    return '100%'
  })

  readonly viewportWidth = computed(() => {
    if (this.carouselService.slidesInfo.direction() === 'horizontal') {
      const width = (this.carouselService.slidesInfo.layout().slideMainAxisSize) *
        this.carouselService.slidesInfo.layout().slidesPerView
      return `${width}px`
    }
    return '100%'
  })

  readonly slideHeight = computed(() => {
    if (this.carouselService.slidesInfo.direction() === 'vertical')
      return `${this.carouselService.slidesInfo.layout().slideMainAxisSize}px`

    return `auto`
  })

  readonly slideWidth = computed(() => {
    if (this.carouselService.slidesInfo.direction() === 'horizontal')
      return `${this.carouselService.slidesInfo.layout().slideMainAxisSize}px`

    return `auto`
  })

  readonly isVertical = computed(() => this.carouselService.slidesInfo.direction() === 'vertical')

  private carouselOptions: CarouselOptions = {
    requiresEnrichment: true,
    slidesPerGroup: 1,
    orientation: 'vertical',
    centeredSlides: true,
    slidesConfig: {
      containerOrientation: 'horizontal',
      skeletonCount: 1,
      slidesPerView: 5,
      centeredSlides: true,
      aspectRatio: 9 / 16,
      maxScale: 2,
      breakpoints: {
        768: {
          containerOrientation: 'vertical',
          skeletonCount: 1,
          slidesPerView: 5,
          centeredSlides: true,
          aspectRatio: 16 / 9,
          maxScale: 2
        }
      }
    }

  }

  constructor() {
    this.loader.setupInfiniteScroll(this.sentinels, this.carouselContainer)
    this.carouselService.initialize(this.carouselContainer, this.carouselOptions, this.loader)
  }
}
