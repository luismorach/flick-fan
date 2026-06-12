import { Component, computed, inject, input, model, } from '@angular/core';
import { Movie } from '../../core/interfaces/movie/movie.interface';
import { IconComponent } from '../../shared/icon/icon.component';
import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { MinutesToTimePipe } from '../../shared/pipes/minutes-to-time/minutes-to-time.pipe';
import { Genre } from '../../core/interfaces/shared/genre.interface';
import { FloatTrailerService } from '../../core/services/float-trailer/float-trailer.service';
import { getKeyTrailer } from '../../shared/utils/helpers';
import { RouterLink } from '@angular/router';
import { TooltipDirective } from '../../core/directives/tooltip/tooltip.directive';
import { Serie } from '../../core/interfaces/serie/serie.interface';

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

  readonly currentTrailerKey = computed(() => {
    const currentItem = this.selectedItem()
    if (!currentItem) return undefined
    return getKeyTrailer(currentItem.videos)
  });

  title = computed(() => {
    const media = this.selectedItem()
    if (this.isMovie(media)) return media.title
    return media?.name ?? 'Unknown title'
  })

  titleImage = computed(() => {
    const media = this.selectedItem()
    const logos = media?.images?.logos;
    if (!logos?.length) return undefined
    return logos[0].file_path
  })

  link = computed(() => {
    const media = this.selectedItem()
    const type = (this.isMovie(media)) ? 'movie' : 'serie';
    return `/details-${type}`
  })

  selectGenre(genre: Genre) {
    if (genre.id === this.selectedGenre().id) return
    this.selectedGenre.set(genre)
  }

  playTrailer(): void {
    this.floatTrailer.register(this, this.selectedItem)
  }

  isMovie(item: any): item is Movie {
    return 'title' in item && 'runtime' in item
  }


}
