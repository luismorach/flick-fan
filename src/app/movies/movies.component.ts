import { ChangeDetectionStrategy, Component, effect,  inject, signal, untracked,  viewChild,  WritableSignal } from '@angular/core';
import { ApiService } from '../core/services/API/api.service';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { Movie, MovieList, OptionMovie } from '../core/interfaces/movie/movie.interface';
import { MoviesGridComponent } from "../shared/components/cards-grid/movies-grid/movies-grid.component";
import { CustomSelectComponent } from "../shared/components/elements/custom-select/custom-select.component";
import { IconComponent } from '../shared/icon/icon.component';
import { Genre } from '../core/interfaces/shared/genre.interface';
import { DetailsCardComponent } from "../shared/components/cards-grid/details-card/details-card.component";

@Component({
  selector: 'app-movies',
  imports: [
    BackgroundNavScrollDirective,
    CustomSelectComponent,
    IconComponent,
    MoviesGridComponent,
    DetailsCardComponent
],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export default class MoviesComponent {

  readonly api = inject(ApiService);
  readonly movies = signal<MovieList | undefined>(undefined);
  selectedMovie = signal<Movie | undefined>(undefined)

  private readonly moviesGrid = viewChild.required<MoviesGridComponent>(MoviesGridComponent)

  optionsMovies: OptionMovie[] = [
    { name: 'En cartelera', id: 0, value: 'now_playing_movies' },
    { name: 'Populares', id: 1, value: 'popular_movies' },
    { name: 'Mejores valorados', id: 2, value: 'top_rated_movies' },
    { name: 'Estrenos', id: 3, value: 'upcoming_movies' }
  ]

  optionsGenre: Genre[] = [
    { name: 'Todos los géneros', id: 0 },
    ...this.api.moviesGenres()
  ]

  optionMovieSelected: WritableSignal<OptionMovie> = signal(this.optionsMovies[0])
  selectedGenre: WritableSignal<Genre> = signal({ name: 'Todos los géneros', id: 0 })

  changeOptionMovieSelected = effect(() => {
    const option = this.optionMovieSelected()
    untracked(() => this.filterByList(option))
  })

  constructor() {}

  test() {
    const x = {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
      type: ''
    }
    this.movies.set(x as MovieList)
  }

  filterByList(option: OptionMovie) {

    const apiMethod = this.api.methodMap[option.value]
    if (!apiMethod) throw new Error(`Unknown data type: ${option.value}`);

    apiMethod().subscribe((movies: MovieList) => {
      this.movies.set(movies)
      requestAnimationFrame(()=>this.moviesGrid().selectMovie(this.moviesGrid().data()[0], 0))
    })
  }
}
