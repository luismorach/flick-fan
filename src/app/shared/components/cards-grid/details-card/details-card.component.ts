import { Component, computed, inject, input, model } from '@angular/core';
import { Movie } from '../../../../core/interfaces/movie/movie.interface';
import { IconComponent } from '../../../icon/icon.component';
import { AutoImagePipe } from '../../../pipes/autoimage/auto-image.pipe';
import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { MinutesToTimePipe } from '../../../pipes/minutes-to-time/minutes-to-time.pipe';
import { Genre } from '../../../../core/interfaces/shared/genre.interface';
import { FloatTrailerService } from '../../../../core/services/float-trailer/float-trailer.service';
import { getKeyTrailer } from '../../../utils/helpers';
import { RouterLink } from '@angular/router';
import { TooltipDirective } from '../../../../core/directives/tooltip/tooltip.directive';

@Component({
  selector: 'app-details-card',
  imports: [
    IconComponent,
    AutoImagePipe,
    DecimalPipe,
    MinutesToTimePipe,
    DatePipe,
    RouterLink,
    NgOptimizedImage,
    TooltipDirective
  ],
  templateUrl: './details-card.component.html',
  styleUrl: './details-card.component.css'
})
export class DetailsCardComponent {
  readonly selectedMovie = input.required<Movie | undefined>()
  readonly selectedGenre = model.required<Genre>()
  private readonly floatTrailer = inject(FloatTrailerService);

  readonly currentTrailerKey = computed(() => {
    const currentMovie = this.selectedMovie()
    if (!currentMovie) return undefined
    return getKeyTrailer(currentMovie.videos)
  });


  selectGenre(genre: Genre) {
    if (genre.id === this.selectedGenre().id) return
    this.selectedGenre.set(genre)
  }

  playTrailer(): void {
    this.floatTrailer.showFloatTrailer(this.currentTrailerKey())
  }
}
