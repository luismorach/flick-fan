import { Component, input } from '@angular/core';
import { SwiperHelper } from '../../../utils/swiper/swiper-helper';
import { Movie, MovieList } from '../../../../core/interfaces/movie/movie.interface';
import { Serie, SerieList } from '../../../../core/interfaces/serie/serie.interface';

@Component({
  selector: 'app-carousel-navigation',
  imports: [],
  templateUrl: './carousel-navigation.component.html',
  styleUrl: './carousel-navigation.component.css'
})
export class CarouselNavigationComponent {
  swiperHelper = input.required<SwiperHelper<Movie> | SwiperHelper<Serie>>();
}
