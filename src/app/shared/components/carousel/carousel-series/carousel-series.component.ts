import {
  ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef, inject, input, viewChild,
} from '@angular/core';
import { SwiperContainer } from 'swiper/element/bundle';
import { fade } from '../../../animations/animations';
import { CardSerieComponent } from './card-serie/card-serie.component';
import { Serie, SerieList } from '../../../../core/interfaces/serie/serie.interface';
import { SkeletonSlidesHook, useSkeletonSlides } from '../../../utils/use-skeleton-slides';
import { SwiperHelper } from '../../../utils/swiper/swiper-helper';
import { CarouselSeriesSkeletonComponent } from './carousel-series-skeleton/carousel-series-skeleton.component';
import { CarouselNavigationComponent } from '../carousel-navigation/carousel-navigation.component';
import { DataLoaderManager } from '../../../utils/data-loader-manager';
import { SwiperOptions } from 'swiper/types';
import { SwiperRegistryService } from '../../../../core/services/swiper-registry/swiper-registry.service';

@Component({
  selector: 'app-carousel-series',
  imports: [CardSerieComponent, CarouselSeriesSkeletonComponent, CarouselNavigationComponent],
  providers: [DataLoaderManager, SwiperHelper],
  templateUrl: './carousel-series.component.html',
  styleUrl: './carousel-series.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CarouselSeriesComponent {

  // Inputs
  seriesList = input.required<SerieList | undefined>();
  title = input.required<string>();

  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  readonly swiperHelper = inject(SwiperHelper<Serie>);
  private readonly swiperRegistry = inject(SwiperRegistryService);

  // ViewQuery
  readonly swiperContainer = viewChild<ElementRef<SwiperContainer>>('swiper');

  //Configuration
  private static readonly SLIDE_CONFIG = {
    width: 288,
    isCarousel: true
  } as const;

  //state
  readonly slides: SkeletonSlidesHook = useSkeletonSlides(
    CarouselSeriesComponent.SLIDE_CONFIG.width,
    CarouselSeriesComponent.SLIDE_CONFIG.isCarousel
  );

  private readonly SWIPER_CONFIG: SwiperOptions = {
    slidesPerView: 'auto',
    allowTouchMove: false,
    slidesPerGroup: this.slides.slidesPerView(),
    spaceBetween: this.slides.spaceBetween(),
    slidesOffsetAfter: this.slides.spaceBetween()+ this.slides.paddingX(),
    slidesOffsetBefore: this.slides.paddingX() + this.slides.spaceBetween(),
    freeMode: {
      enabled: true,
      momentum: false
      
    },
  }

  constructor() {
    this.swiperRegistry.registerOnce()
    this.swiperHelper.initialize(this.swiperContainer, this.seriesList, this.SWIPER_CONFIG, this.slides)
    this.destroyRef.onDestroy(() => {
      this.swiperHelper.destroy()
    });
  }

  onSlideExpandHover(index: number): void {
    this.swiperHelper.adjustTranslateForExpandedSlide(index)
  }

  async onSlideCollapseHover(): Promise<void> {
    this.swiperHelper.restoreBaseTranslate()
    await this.swiperHelper.updateSwiperAfterHoverTransition()
  }
}
