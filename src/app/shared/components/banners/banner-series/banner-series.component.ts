import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef, inject, input, viewChild, ViewEncapsulation } from '@angular/core';
import { SwiperContainer } from 'swiper/element/bundle';
import { SwiperOptions } from 'swiper/types';
import { NgOptimizedImage} from '@angular/common';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { SerieList, Serie } from '../../../../core/interfaces/serie/serie.interface';
import { SwiperRegistryService } from '../../../../core/services/swiper-registry/swiper-registry.service';
import { SwiperHelper } from '../../../utils/swiper/swiper-helper';
import { DataLoaderManager } from '../../../utils/data-loader-manager';
import { AutoImagePipe } from '../../../pipes/autoimage/auto-image.pipe';
import { CarouselNavigationComponent } from "../../carousel/carousel-navigation/carousel-navigation.component";
import { fade } from '../../../animations/animations';
import { SlideStyleDirective } from "../../../../core/directives/slide-style/slide-style.directive";
import { BannerDetailsComponent } from "./banner-details/banner-details.component";

@Component({
  selector: 'app-banner-series',
  imports: [
    NgOptimizedImage,
    SkeletonComponent,
    AutoImagePipe,
    CarouselNavigationComponent,
    SlideStyleDirective,
    BannerDetailsComponent
],
  providers: [SwiperHelper, DataLoaderManager],
  templateUrl: './banner-series.component.html',
  styleUrl: './banner-series.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation:ViewEncapsulation.None
})

export class BannerSeriesComponent {

  // Input
  readonly listSeries = input.required<SerieList | undefined>()

  // Dependencies
  private readonly swiperRegistry = inject(SwiperRegistryService);
  readonly swiperHelper = inject(SwiperHelper<Serie>);
  private readonly destroyRef = inject(DestroyRef)

  // View Queries
  readonly swiperContainer = viewChild<ElementRef<SwiperContainer>>('swiper');

  private readonly SWIPER_CONFIG: SwiperOptions = {
    speed: 300,
    direction: 'vertical',
    slidesPerView: 5,
    slidesPerGroup: 1,
    allowTouchMove: false,
    centeredSlides: true,
  };

  constructor() {
    this.swiperRegistry.registerOnce()

    /**
   * Pass the swiper container so that swiperHeper
   * uses `effect(() => signal())` and reacts to changes.
   * • WHY?
   * • #swiper may not exist on init → effect waits for it
   */
    this.swiperHelper.initialize(this.swiperContainer, this.listSeries, this.SWIPER_CONFIG,undefined,true)

    this.destroyRef.onDestroy(()=>this.swiperHelper.destroy())

  }
}
