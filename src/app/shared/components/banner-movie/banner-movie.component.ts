import {
  Component, inject, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, effect, ElementRef,
  input, viewChild,computed
} from '@angular/core';
import { DatePipe,NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { SwiperContainer } from 'swiper/element/bundle'
import { RouterLink } from '@angular/router';
import { RatingComponent } from '../rating/rating.component';
import { fade } from '../../animations/animations';
import { MinutesToTimePipe } from '../../pipes/minutes-to-time/minutes-to-time.pipe';
import { BannerSkeletonComponent } from './banner-skeleton/banner-skeleton.component';
import { MovieList, Movie } from '../../../core/interfaces/movie/movie.interface';
import { getKeyTrailer } from '../../utils/helpers';
import { DataLoaderManager } from '../../utils/data-loader-manager';
import { FloatTrailerService } from '../../../core/services/float-trailer/float-trailer.service';
import { SwiperRegistryService } from '../../../core/services/swiper-registry/swiper-registry.service';
import { SwiperHelper } from '../../utils/swiper/swiper-helper';
import { CarouselNavigationComponent } from "../carousel/carousel-navigation/carousel-navigation.component";
import { IconComponent } from "../../icon/icon.component";
import { AutoImagePipe } from '../../pipes/autoimage/auto-image.pipe';

@Component({
  selector: 'app-banner-movie',
  imports: [
    DatePipe, 
    NgOptimizedImage, 
    RouterLink,
    RatingComponent,
    MinutesToTimePipe, 
    BannerSkeletonComponent, 
    CarouselNavigationComponent,
    IconComponent, 
    AutoImagePipe,
    NgTemplateOutlet
  ],
  providers: [DataLoaderManager, SwiperHelper],
  templateUrl: './banner-movie.component.html',
  styleUrl: './banner-movie.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade]
})

export default class BannerMovieComponent {
  // Dependencies
  private readonly floatTrailer = inject(FloatTrailerService);
  private readonly swiperRegistry = inject(SwiperRegistryService);
  readonly swiperHelper = inject(SwiperHelper<Movie>);

  // Inputs
  readonly movieList = input.required<MovieList | undefined>()

  // View Queries
  readonly swiperContainer = viewChild<ElementRef<SwiperContainer>>('swiper');

  // Computed values
  readonly currentTrailerKey = computed(() =>
    getKeyTrailer(this.swiperHelper.currentElement())
  );

  constructor() {
    this.swiperRegistry.registerOnce()
    this.swiperHelper.initialize(this.swiperContainer, this.movieList)

    effect(() => {
      this.floatTrailer.setVideoKey(this.currentTrailerKey())
    })
  }

  playTrailer(): void {
    this.floatTrailer.showTrailer(this.currentTrailerKey())
  }
}






