import {
  ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef,ElementRef, inject, input,viewChild, 
} from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle';
import { fade } from '../../../animations/animations';
import { CardSerieComponent } from './card-serie/card-serie.component';
import { SerieList } from '../../../../core/interfaces/serie/serie.interface';
import { SkeletonSlidesHook, useSkeletonSlides } from '../../../utils/use-skeleton-slides';
import { SwiperHelper } from '../../../utils/swiper/swiper-helper';
import { CarouselSeriesSkeletonComponent } from './carousel-series-skeleton/carousel-series-skeleton.component';
import { CarouselNavigationComponent } from '../carousel-navigation/carousel-navigation.component';

register();

@Component({
  selector: 'app-carousel-series',
  imports: [CardSerieComponent,CarouselSeriesSkeletonComponent,CarouselNavigationComponent],
  templateUrl: './carousel-series.component.html',
  styleUrl: './carousel-series.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CarouselSeriesComponent{

  // Inputs
  seriesList = input.required<SerieList | undefined>();
  title = input.required<string>();

  // Dependencies
  private readonly destroyRef = inject(DestroyRef);

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
  readonly swiperHelper = new SwiperHelper<SerieList>(this.slides);

  constructor() {
    this.swiperHelper.initialize(this.swiperContainer, this.seriesList)

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
