import {
  Component, inject, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, ElementRef,
  input, viewChild,  ViewEncapsulation,
  computed,
  effect
} from '@angular/core';
import { SwiperContainer } from 'swiper/element/bundle'
import { fade } from '../../../animations/animations';
import { BannerSkeletonComponent } from './banner-skeleton/banner-skeleton.component';
import { MovieList, Movie } from '../../../../core/interfaces/movie/movie.interface';
import { DataLoaderManager } from '../../../utils/data-loader-manager';
import { SwiperRegistryService } from '../../../../core/services/swiper-registry/swiper-registry.service';
import { SwiperHelper } from '../../../utils/swiper/swiper-helper';
import { CarouselNavigationComponent } from "../../carousel/carousel-navigation/carousel-navigation.component";
import { BannerDetailComponent } from "./banner-movie-details/banner-movie-details.component";
import { SwiperOptions } from 'swiper/types';
import { getKeyTrailer } from '../../../utils/helpers';
import { FloatTrailerService } from '../../../../core/services/float-trailer/float-trailer.service';

@Component({
  selector: 'app-banner-movies',
  imports: [
    BannerSkeletonComponent,
    CarouselNavigationComponent,
    BannerDetailComponent
  ],
  providers: [DataLoaderManager, SwiperHelper],
  templateUrl: './banner-movies.component.html',
  styleUrl: './banner-movies.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade],
  encapsulation: ViewEncapsulation.None
})

export default class BannerMoviesComponent {
  // Dependencies
  private readonly swiperRegistry = inject(SwiperRegistryService);
  readonly swiperHelper = inject(SwiperHelper<Movie>);
  private readonly floatTrailer = inject(FloatTrailerService);

  // Inputs
  readonly movieList = input.required<MovieList | undefined>()

  // View Queries
  readonly swiperContainer = viewChild<ElementRef<SwiperContainer>>('swiper');

  readonly currentTrailerKey = computed(() =>{
    if(!this.swiperHelper.currentElement()) return undefined
    return getKeyTrailer(this.swiperHelper.currentElement().videos)}
  );

  updateVideoKey = effect(() => {
    this.floatTrailer.setVideoKey(this.currentTrailerKey())
  })

  private readonly SWIPER_CONFIG: SwiperOptions = {
    speed: 500,
    slidesPerView: 1,
    slidesPerGroup: 1,
    allowTouchMove: true,
    pagination: {
      enabled: true,
      dynamicBullets: true,
    },
  }

  constructor() {
    this.swiperRegistry.registerOnce()
    this.swiperHelper.initialize(this.swiperContainer, this.movieList, this.SWIPER_CONFIG,undefined,true)
  }

}






