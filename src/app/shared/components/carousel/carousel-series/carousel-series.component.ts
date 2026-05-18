import {
  ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, input, viewChild,
  viewChildren,
} from '@angular/core';
import { fade } from '../../../animations/animations';
import { CardSerieComponent } from './card-serie/card-serie.component';
import { Serie, SerieList } from '../../../../core/interfaces/serie/serie.interface';
import { CarouselSeriesSkeletonComponent } from './carousel-series-skeleton/carousel-series-skeleton.component';
import { CarouselNavigationComponent } from '../carousel-navigation/carousel-navigation.component';
import { CarouselOptions } from '../../../../core/interfaces/shared/carousel-interface';
import { CdkScrollable } from "@angular/cdk/scrolling";
import { useSlideExpansion } from '../../../utils/use-slide-expansion';
import { CarouselService } from '../../../../core/services/carousel/carousel-service';
import { hasPagination, withPagination } from '../../../utils/data-loaders/enhancers/with-pagination';
import { useDataLoader } from '../../../utils/data-loaders/use-data-loader';
import { WithDetails } from '../../../utils/data-loaders/enhancers/with-details';
import { hasInfiniteScroll, withInfiniteScroll } from '../../../utils/data-loaders/enhancers/with-infinite-scroll';

@Component({
  selector: 'app-carousel-series',
  imports: [CardSerieComponent, CarouselSeriesSkeletonComponent, CarouselNavigationComponent, CdkScrollable],
  providers: [CarouselService],
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
  readonly subtitle = input<string>();

  // Dependencies
  readonly carouselService = inject(CarouselService<SerieList, 'results'>)
  readonly slideExpansion = useSlideExpansion()
  readonly loader = useDataLoader<SerieList, 'results'>('results', this.seriesList).pipe(
    withInfiniteScroll,
    WithDetails,
  )


  // Configuration
  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carousel')
  private readonly sentinels = viewChildren<ElementRef<HTMLElement>>('sentinels')

  private carouselOptions: CarouselOptions = {
    requiresEnrichment: false,
    orientation: 'horizontal',
    requireSnapMandatory: false,
    slidesConfig: {
      slidesPerView: 1,
      peekSkeletonOffset: 1,
      peek: 24,
      spaceBetween: 24,
      expandedSlideMultiplier: 2.6,
      breakpoints: {
        398: { slidesPerView: 1.5 },
        508: { slidesPerView: 2, },
        748: { slidesPerView: 3, peek: 32 },
        988: { slidesPerView: 4, peek: 44 },
        1388: { slidesPerView: 5 }
      }
    }
  }

  constructor() {
    if (hasInfiniteScroll(this.loader)) {
      this.loader.setupInfiniteScroll(this.sentinels, this.carouselContainer)
    }
    this.carouselService.initialize(this.carouselContainer, this.carouselOptions, this.loader)
  }

  onSlideExpandHover(index: number) {
    const slide = this.carouselContainer()?.nativeElement.children[index] as HTMLElement
    console.log('expaddiennddo', slide)

    if (!slide) return

    this.slideExpansion.adjustTranslateForExpandedSlide(
      slide,
      this.carouselService.slidesInfo,
      this.carouselService.state().currentPosition())
  }

  onSlideCollapseHover() {
    this.slideExpansion.restoreBaseTranslate()
  }

  canLoadMore() {
    return hasPagination(this.loader) && this.loader.canLoadMore()
  }

}
