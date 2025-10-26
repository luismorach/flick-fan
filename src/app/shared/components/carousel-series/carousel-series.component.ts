import {
  AfterViewInit, ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA,
  ElementRef, input, OnDestroy, signal, ViewChild,
} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CarouselSeriesComponent implements AfterViewInit, OnDestroy {

  // Inputs
  seriesList = input.required<SerieList | undefined>();
  title = input.required<string>();

  // ViewChild
  @ViewChild('swiper', { static: false, read: ElementRef }) swiperContainer!: ElementRef<SwiperContainer>
  swiperHelper: SwiperHelper<SerieList>;

  //Configuration
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
    this.swiperHelper.setupInfiniteDataLoading(this.seriesList)
  }

  ngAfterViewInit(): void {
    this.swiperHelper.initSwiper(this.swiperContainer);
  }

  ngOnDestroy(): void {
    this.swiperHelper.destroy()
  }

  onSlideExpandHover(index: number): void {
    this.swiperHelper.adjustTranslateForExpandedSlide(index)
  }

  async onSlideCollapseHover(): Promise<void> {
    this.swiperHelper.restoreBaseTranslate()
    await this.swiperHelper.updateSwiperAfterHoverTransition()
  }
}
