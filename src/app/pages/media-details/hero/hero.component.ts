import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/icon/icon.component';
import { Movie } from '../../../core/interfaces/movie/movie.interface';
import { Serie } from '../../../core/interfaces/serie/serie.interface';
import { MinutesToTimePipe } from '../../../shared/pipes/minutes-to-time/minutes-to-time.pipe';
import { isMovie, getReleaseDate } from '../../../shared/utils/helpers';

@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage, DecimalPipe, IconComponent, RouterLink,DatePipe,MinutesToTimePipe],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
  media = input.required<Movie | Serie | undefined>();
  isMovie = isMovie;
  title = computed(() => {
    const media = this.media()
    if (isMovie(media)) return media.title
    return media?.name ?? 'Unknown title'
  })

  link = computed(() => `/watch-${isMovie(this.media()) ? 'movie' : 'serie'}/${this.media()?.id}`)
  releaseDate = computed(() => getReleaseDate(this.media()))
 
}
