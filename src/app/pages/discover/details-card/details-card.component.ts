import { Component, computed, inject, input, model, } from '@angular/core';
import { Movie } from '../../../core/interfaces/movie/movie.interface';
import { IconComponent } from '../../../shared/icon/icon.component';
import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { MinutesToTimePipe } from '../../../shared/pipes/minutes-to-time/minutes-to-time.pipe';
import { Genre } from '../../../core/interfaces/shared/genre.interface';
import { FloatTrailerService } from '../../../core/services/float-trailer/float-trailer.service';
import { getComputedTitle, getComputedTitleImageUrl, getKeyTrailer, isMovie } from '../../../shared/utils/helpers';
import { RouterLink } from '@angular/router';
import { TooltipDirective } from '../../../core/directives/tooltip/tooltip.directive';
import { Serie } from '../../../core/interfaces/serie/serie.interface';

@Component({
  selector: 'app-details-card',
  imports: [
    IconComponent,
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
  readonly selectedItem = input.required<Movie | Serie | undefined>()
  readonly selectedGenre = model.required<Genre>()
  private readonly floatTrailer = inject(FloatTrailerService);
  isMovie = isMovie

  readonly currentTrailerKey = computed(() => {
    const currentItem = this.selectedItem()
    if (!currentItem) return undefined
    return getKeyTrailer(currentItem.videos)
  });

  title = getComputedTitle(this.selectedItem)

  titleImage = getComputedTitleImageUrl(this.selectedItem)

  link = computed(() => {
    const media = this.selectedItem()
    const type = (this.isMovie(media)) ? 'movie' : 'serie';
    return `/details/${type}/${media?.id}`
  })

  selectGenre(genre: Genre) {
    if (genre.id === this.selectedGenre().id) return
    this.selectedGenre.set(genre)
  }

  playTrailer(): void {
    this.floatTrailer.register(this, this.selectedItem)
  }

  


}
