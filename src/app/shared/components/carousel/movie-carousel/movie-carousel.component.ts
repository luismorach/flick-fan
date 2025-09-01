import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { Movie } from '../../../interfaces/interfaces';
import { MinutesToTimePipe } from '../../../pipes/minutes-to-time.pipe';
import { getWideImage } from '../../../utils//images-by-default';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-movie-carousel',
  standalone: true,
  imports: [NgOptimizedImage, CommonModule, DatePipe, MinutesToTimePipe,RouterLink],
  templateUrl: './movie-carousel.component.html',
  styleUrls: ['./movie-carousel.component.css']
})
export class MovieCarouselComponent {
  getWideImage = getWideImage
  movie = input.required<Movie>();
  isHovered = input.required<boolean>()
}
