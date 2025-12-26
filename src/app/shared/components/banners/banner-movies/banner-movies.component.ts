import {
  Component, inject, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, ElementRef,
  input, viewChild, computed, effect
} from '@angular/core';
import { fade } from '../../../animations/animations';
import { BannerSkeletonComponent } from './banner-skeleton/banner-skeleton.component';
import { MovieList, Movie } from '../../../../core/interfaces/movie/movie.interface';
import { DataLoaderManager } from '../../../utils/data-loader-manager';
import { CarouselNavigationComponent } from "../../carousel/carousel-navigation/carousel-navigation.component";
import { BannerDetailComponent } from "./banner-movie-details/banner-movie-details.component";
import { getKeyTrailer } from '../../../utils/helpers';
import { FloatTrailerService } from '../../../../core/services/float-trailer/float-trailer.service';
import { CarouselService } from '../../../../core/services/carousel/carousel.service';
import { IntersectionObserverManager } from '../../../utils/intersectionObserver';

@Component({
  selector: 'app-banner-movies',
  imports: [
    BannerSkeletonComponent,
    CarouselNavigationComponent,
    BannerDetailComponent
  ],
  providers: [DataLoaderManager, CarouselService,IntersectionObserverManager],
  templateUrl: './banner-movies.component.html',
  styleUrl: './banner-movies.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade],
})

export default class BannerMoviesComponent {
  // Dependencies
  readonly carouselService = inject(CarouselService<Movie>);
  private readonly floatTrailer = inject(FloatTrailerService);

  // Inputs
  readonly movieList = input.required<MovieList | undefined>()

  // View Queries
  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carousel')

  readonly currentTrailerKey = computed(() => {
    if (!this.carouselService.currentElement()) return undefined
    return getKeyTrailer(this.carouselService.currentElement().videos)
  }
  );

  updateVideoKey = effect(() => {
    this.floatTrailer.setVideoKey(this.currentTrailerKey())
  })

  constructor() {
    this.carouselService.initialize(this.carouselContainer, this.movieList, { requiresIntersectionObserver: true })
  }

}






