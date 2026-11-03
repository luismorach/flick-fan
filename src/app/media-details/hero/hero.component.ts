import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';
import { Movie } from '../../core/interfaces/movie/movie.interface';
import { Serie } from '../../core/interfaces/serie/serie.interface';
import { RouterLink } from '@angular/router';
import { getReleaseDate, isMovie } from '../../shared/utils/helpers';
import { MinutesToTimePipe } from '../../shared/pipes/minutes-to-time/minutes-to-time.pipe';

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

  titleImage = computed(() => {
    const media = this.media()
    const logos = media?.images?.logos;
    if (!logos?.length) return undefined
    return logos[0].file_path
  })

  link = computed(() => `/watch-${isMovie(this.media()) ? 'movie' : 'serie'}/${this.media()?.id}`)
  releaseDate = computed(() => getReleaseDate(this.media()))
 
}
