import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, untracked, viewChild, viewChildren } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { SerieList, Serie } from '../../../../core/interfaces/serie/serie.interface';
import { fade } from '../../../animations/animations';
import { SlideStyleDirective } from "../../../../core/directives/slide-style/slide-style.directive";
import { BannerDetailsComponent } from "./banner-details/banner-details.component";
import { CarouselOptions } from '../../../../core/interfaces/shared/carousel-interface';
import { useDataLoader } from '../../../utils/data-loaders/use-data-loader';
import { WithDetails } from '../../../utils/data-loaders/enhancers/with-details';
import { hasInfiniteScroll, withInfiniteScroll } from '../../../utils/data-loaders/enhancers/with-infinite-scroll';
import { CarouselService } from '../../../../core/services/test/carousel/carousel-service';
import { CarouselNavigationComponent } from '../../carousel/carousel-navigation/test/carousel-navigation.component';

@Component({
  selector: 'app-banner-series',
  imports: [
    NgOptimizedImage,
    SkeletonComponent,
    CarouselNavigationComponent,
    SlideStyleDirective,
    BannerDetailsComponent,
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
    if (this.carouselService.state().slidesInfo.direction() === 'vertical')
      return `${this.carouselService.state().slidesInfo.layout().spacingToCenterSlide}px 0px`

    return `0px ${this.carouselService.state().slidesInfo.layout().spacingToCenterSlide}px`
  })

  readonly viewportHeight = computed(() => {
    if (this.carouselService.state().slidesInfo.direction() === 'vertical') {
      const height = (this.carouselService.state().slidesInfo.layout().slideMainAxisSize) *
        this.carouselService.state().slidesInfo.layout().slidesPerView
      return `${height}px`
    }
    return '100%'
  })

  readonly viewportWidth = computed(() => {
    if (this.carouselService.state().slidesInfo.direction() === 'horizontal') {
      const width = (this.carouselService.state().slidesInfo.layout().slideMainAxisSize) *
        this.carouselService.state().slidesInfo.layout().slidesPerView
      return `${width}px`
    }
    return '100%'
  })

  readonly slideHeight = computed(() => {
    if (this.carouselService.state().slidesInfo.direction() === 'vertical')
      return `${this.carouselService.state().slidesInfo.layout().slideMainAxisSize}px`

    return `auto`
  })

  readonly slideWidth = computed(() => {
    if (this.carouselService.state().slidesInfo.direction() === 'horizontal')
      return `${this.carouselService.state().slidesInfo.layout().slideMainAxisSize}px`

    return `auto`
  })

  readonly isVertical = computed(() => this.carouselService.state().slidesInfo.direction() === 'vertical')

  private carouselOptions: CarouselOptions = {
    requiresEnrichment: true,
    slidesPerGroup: 1,
    orientation: 'vertical',
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

  init = effect(() => {
    const container = this.carouselContainer()
    if (!container) return
    untracked(() => {
      this.carouselService.initialize(container, this.carouselOptions, this.loader)
      console.log('carrusel iniciado',this.carouselService.state().currentElement?.())
    })
  })
  changecurrentelement=effect(()=>{
    console.log('change element',this.carouselService.state().currentElement)
  })

 
  translate = effect(() => {
    const position = this.carouselService.state().currentPosition?.()
    if (position === undefined) return
    untracked(() => {
      this.carouselService.navigation.translateToCurrentPosition()
    })
  })
 
}
