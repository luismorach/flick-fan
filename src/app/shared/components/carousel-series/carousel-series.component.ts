import { AfterViewInit, ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, 
  ElementRef, input, OnDestroy, output, ViewChild } from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle';
import { fade } from '../../animations/animations';
import { CardSerieSkeletonComponent } from './card-serie-skeleton/card-serie-skeleton.component';
import { CardSerieComponent } from './card-serie/card-serie.component';
import { SerieList } from '../../../core/interfaces/serie/serie.interface';
import { SkeletonSlidesHook, useSkeletonSlides } from '../../utils/use-skeleton-slides';
import { SwiperHelper } from '../../utils/swiper/swiper-helper';

register();

@Component({
  selector: 'app-carousel-series',
  imports: [CardSerieSkeletonComponent, CardSerieComponent],
  templateUrl: './carousel-series.component.html',
  styleUrl: './carousel-series.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [fade],
  changeDetection:ChangeDetectionStrategy.OnPush
})

export class CarouselSeriesComponent implements AfterViewInit, OnDestroy {
  
  seriesList = input.required<SerieList | undefined>()
  title = input.required<string>()
  requestMoreData = output<void>()

  @ViewChild('swiper', { static: false, read: ElementRef }) swiperContainer!: ElementRef<SwiperContainer>
  swiperHelper: SwiperHelper

  private static readonly SLIDE_CONFIG = {
    width: 288,
    isCarousel: true
  } as const;

  slides: SkeletonSlidesHook = useSkeletonSlides(
    CarouselSeriesComponent.SLIDE_CONFIG.width,
    CarouselSeriesComponent.SLIDE_CONFIG.isCarousel
  );

  constructor() {
    this.swiperHelper = new SwiperHelper(this.slides)
  }

  ngAfterViewInit() {
      this.swiperHelper.initSwiper(this.swiperContainer);
      this.swiperHelper.setupInfiniteDataLoading<SerieList>(this.seriesList, this.requestMoreData)
  }

  ngOnDestroy() {
    this.swiperHelper.destroy()
  }

  onSlideExpandHover(index: number) {
    this.swiperHelper.adjustTranslateForExpandedSlide(index)
  }

  async onSlideCollapseHover() {
    this.swiperHelper.restoreBaseTranslate()
    await this.swiperHelper.updateSwiperAfterHoverTransition()
  }
}
