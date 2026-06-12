import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked, WritableSignal } from '@angular/core';
import { ApiService } from '../core/services/API/api.service';
import { Movie} from '../core/interfaces/movie/movie.interface';
import { CardsGridComponent } from "./cards-grid/cards-grid.component";
import { CustomSelectComponent } from "../shared/components/elements/custom-select/custom-select.component";
import { IconComponent } from '../shared/icon/icon.component';
import { Genre } from '../core/interfaces/shared/genre.interface';
import { DetailsCardComponent } from "./details-card/details-card.component";
import { OptionCategory } from '../core/interfaces/shared/option_category';
import { Serie } from '../core/interfaces/serie/serie.interface';
import { NgClass } from '@angular/common';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-discover',
  imports: [
    CustomSelectComponent,
    IconComponent,
    CardsGridComponent,
    DetailsCardComponent,
    NgClass,
    BackgroundNavScrollDirective
  ],
  templateUrl: './discover.component.html',
  styleUrl: './discover.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export default class DiscoverComponent {

  readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute)
  selectedItem = signal<Movie | Serie | undefined>(undefined)
  height = signal(0);

  readonly query = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => of(params.get('query') || ''))
    ),
    { initialValue: '' }
  );

  mediaTypeOptions = [
    { name: 'Películas', id: 0, value: 'movies' },
    { name: 'Series', id: 1, value: 'series' }
  ]

  selectedMediaType = signal('movies')

  movieCategories: OptionCategory[] = [
    { name: 'En cartelera', id: 0, value: 'now_playing_movies',params:{ page: 1 } },
    { name: 'Populares', id: 1, value: 'popular_movies',params:{ page: 1 }  },
    { name: 'Mejores valorados', id: 2, value: 'top_rated_movies',params:{ page: 1 } },
    { name: 'Estrenos', id: 3, value: 'upcoming_movies',params:{ page: 1 } }
  ]

  serieCategories: OptionCategory[] = [
    { name: 'Emitiendo hoy', id: 0, value: 'airing_today_series',params:{ page: 1 } },
    { name: 'En el aire', id: 1, value: 'on_the_air_series',params:{ page: 1 } },
    { name: 'Populares', id: 2, value: 'popular_series',params:{ page: 1 } },
    { name: 'Mejores valorados', id: 3, value: 'top_rated_series',params:{ page: 1 } },
  ]

  readonly getCategories: { [key: string]: OptionCategory[] } = {
    movies: this.movieCategories,
    series: this.serieCategories
  }

  currentCategories = computed(() => this.getCategories[this.selectedMediaType()])
  selectedCategory: WritableSignal<OptionCategory> = signal(this.currentCategories()[0])

  readonly getGenres: { [key: string]: Genre[] } = {
    movies: this.api.moviesGenres(),
    series: this.api.seriesGenres()
  }

  optionsGenre = computed(() => [
    { name: 'Todos los géneros', id: 0 },
    ...this.getGenres[this.selectedMediaType()]
  ]
  )

  selectedGenre: WritableSignal<Genre> = signal(this.optionsGenre()[0])

  changeMediaType = effect(() => {
    const type = this.selectedMediaType()
    untracked(() => {
      this.selectedCategory.set(this.currentCategories()[0])
      this.selectedGenre.set(this.optionsGenre()[0])
    })
  })

   changeQuery = effect(() => {
    const query = this.query()
    if (query === '') return
    this.selectedCategory.set({ name: 'search', id: 4, value: `search_${this.selectedMediaType()}`, params:{ page: 1, query }} )
  })
}
