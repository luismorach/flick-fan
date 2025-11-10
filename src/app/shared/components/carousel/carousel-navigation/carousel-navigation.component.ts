import { Component, input } from '@angular/core';
import { SwiperHelper } from '../../../utils/swiper/swiper-helper';
import { Movie, MovieList } from '../../../../core/interfaces/movie/movie.interface';
import { Serie, SerieList } from '../../../../core/interfaces/serie/serie.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-carousel-navigation',
  imports: [NgClass],
  templateUrl: './carousel-navigation.component.html',
  styleUrl: './carousel-navigation.component.css'
})
export class CarouselNavigationComponent {
  readonly swiperHelper = input.required<SwiperHelper<Movie> | SwiperHelper<Serie>>();
  readonly direcction = input<String>('horizontal')
}
