import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked, WritableSignal } from '@angular/core';
import { ApiService } from '../core/services/API/api.service';
import { Movie, MovieList } from '../core/interfaces/movie/movie.interface';
import { CardsGridComponent} from "../shared/components/cards-grid/cards-grid/cards-grid.component";
import { CustomSelectComponent } from "../shared/components/elements/custom-select/custom-select.component";
import { IconComponent } from '../shared/icon/icon.component';
import { Genre } from '../core/interfaces/shared/genre.interface';
import { DetailsCardComponent } from "../shared/components/cards-grid/details-card/details-card.component";
import { OptionCategory } from '../core/interfaces/shared/option_category';
import { Serie } from '../core/interfaces/serie/serie.interface';

@Component({
  selector: 'app-discover',
  imports: [
    CustomSelectComponent,
    IconComponent,
    CardsGridComponent,
    DetailsCardComponent
  ],
  templateUrl: './discover.component.html',
  styleUrl: './discover.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export default class DiscoverComponent {

  readonly api = inject(ApiService);
  selectedItem = signal<Movie |Serie | undefined>(undefined)

  mediaTypeOptions = [
    { name: 'Películas', id: 0, value: 'movies' },
    { name: 'Series', id: 1, value: 'series' }
  ]

  mediaTypeSelected = signal(this.mediaTypeOptions[0])

  movieCategories: OptionCategory[] = [
    { name: 'En cartelera', id: 0, value: 'now_playing_movies' },
    { name: 'Populares', id: 1, value: 'popular_movies' },
    { name: 'Mejores valorados', id: 2, value: 'top_rated_movies' },
    { name: 'Estrenos', id: 3, value: 'upcoming_movies' }
  ]

  serieCategories: OptionCategory[] = [
    { name: 'Emitiendo hoy', id: 0, value: 'airing_today_series' },
    { name: 'En el aire', id: 1, value: 'on_the_air_series' },
    { name: 'Populares', id: 2, value: 'popular_series' },
    { name: 'Mejores valorados', id: 3, value: 'top_rated_series' },
  ]

  readonly getCategories: { [key: string]: OptionCategory[] } = {
    movies: this.movieCategories,
    series: this.serieCategories
  }

  currentCategories = computed(() => this.getCategories[this.mediaTypeSelected().value])
  selectedCategory: WritableSignal<OptionCategory> = signal(this.currentCategories()[0])

  readonly getGenres: { [key: string]: Genre[] } = {
    movies: this.api.moviesGenres(),
    series: this.api.seriesGenres()
  }
  optionsGenre = computed(() => [
    { name: 'Todos los géneros', id: 0 },
    ...this.getGenres[this.mediaTypeSelected().value]
  ]
  )

  selectedGenre: WritableSignal<Genre> = signal(this.optionsGenre()[0])

  changeMediaType = effect(() => {
    const type = this.mediaTypeSelected()
    untracked(() => {
      this.selectedCategory.set(this.currentCategories()[0])
      this.selectedGenre.set(this.optionsGenre()[0])
    })
  })
}
