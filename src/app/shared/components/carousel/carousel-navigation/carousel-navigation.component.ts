import { Component, input } from '@angular/core';
import { Movie} from '../../../../core/interfaces/movie/movie.interface';
import { Serie} from '../../../../core/interfaces/serie/serie.interface';
import { NgClass } from '@angular/common';
import { CarouselService } from '../../../../core/services/carousel/carousel.service';

@Component({
  selector: 'app-carousel-navigation',
  imports: [NgClass],
  templateUrl: './carousel-navigation.component.html',
  styleUrl: './carousel-navigation.component.css'
})
export class CarouselNavigationComponent {
  readonly carouselService = input.required<CarouselService<Movie> | CarouselService<Serie>>();
  readonly direcction = input<String>('horizontal')
}
