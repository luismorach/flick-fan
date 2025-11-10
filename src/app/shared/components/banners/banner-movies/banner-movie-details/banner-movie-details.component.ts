import { Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../../../../icon/icon.component';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { RatingComponent } from '../../../rating/rating.component';
import { Movie } from '../../../../../core/interfaces/movie/movie.interface';
import { AutoImagePipe } from '../../../../pipes/autoimage/auto-image.pipe';
import { MinutesToTimePipe } from '../../../../pipes/minutes-to-time/minutes-to-time.pipe';
import { RouterLink } from '@angular/router';
import { getKeyTrailer } from '../../../../utils/helpers';

@Component({
  selector: 'app-banner-movie-details',
  imports: [IconComponent, NgOptimizedImage, RatingComponent, AutoImagePipe, MinutesToTimePipe, DatePipe, RouterLink],
  templateUrl: './banner-movie-details.component.html',
  styleUrl: './banner-movie-details.component.css'
})
export class BannerDetailComponent {

  readonly movie = input.required<Movie>()
  readonly onPlayTrailer = output<void>()

  readonly currentTrailerKey = computed(() =>
    getKeyTrailer(this.movie())
  );
}
