import {
  ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, input,
  output, ViewChild, ViewEncapsulation } from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle'
import { NgClass } from '@angular/common';
import { CardMovieSkeletonComponent } from './card-movie-skeleton/card-movie-skeleton.component';
import { fade } from '../../animations/animations';
import { CardMovieComponent } from './card-movie/card-movie.component';
import { MovieList } from '../../../core/interfaces/movie/movie.interface';
import { SwiperHelper } from '../../utils/swiper/swiper-helper';
import { useSkeletonSlides } from '../../utils/use-skeleton-slides';

register();

@Component({
  selector: 'app-carousel',
  imports: [NgClass, CardMovieSkeletonComponent, CardMovieComponent],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [fade]
})

export class CarouselComponent {
  
  requestMoreData = output<void>()
  movieList = input.required<MovieList | undefined>()
  title = input.required<string>()
  importance = input.required<number>()

  @ViewChild('swiper', { static: false, read: ElementRef }) swiperContainer!: ElementRef<SwiperContainer>

  swiperHelper!: SwiperHelper
  slides = useSkeletonSlides(320, true);

  constructor() {
    this.swiperHelper = new SwiperHelper(this.slides)
  }

  ngAfterViewInit() {
    this.swiperHelper.initSwiper(this.swiperContainer)
    this.swiperHelper.setImportance(this.importance)
    this.swiperHelper.setupInfiniteDataLoading<MovieList>(this.movieList, this.requestMoreData)
  }

  ngOnDestroy() {
    this.swiperHelper.destroy()
  }
}
