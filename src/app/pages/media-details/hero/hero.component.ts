import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, input, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/icon/icon.component';
import { Movie } from '../../../core/interfaces/movie/movie.interface';
import { Serie } from '../../../core/interfaces/serie/serie.interface';
import { MinutesToTimePipe } from '../../../shared/pipes/minutes-to-time/minutes-to-time.pipe';
import { isMovie,  getComputedTitle, getCertification, getComputedCertification } from '../../../shared/utils/helpers';

@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage, DecimalPipe, IconComponent, RouterLink,DatePipe,MinutesToTimePipe],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
  media = input.required<Movie | Serie | undefined>();
  isMovie = isMovie;
  title = getComputedTitle(this.media)
  releaseDate = getComputedCertification(this.media)


  link = computed(() => {
    const media = this.media()
     if (!media) return ''
      const id = media.id
      if (!id) return ''
      if (isMovie(media)) return `/watch/movie/${id}`
      return `/watch/serie/${id}/1/1`
  })

 
}
