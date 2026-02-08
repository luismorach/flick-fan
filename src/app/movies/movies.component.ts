import { ChangeDetectionStrategy, Component, computed, effect,  inject, signal, untracked,  viewChild,  WritableSignal } from '@angular/core';
import { ApiService } from '../core/services/API/api.service';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { Movie, MovieList, OptionMovie } from '../core/interfaces/movie/movie.interface';
import { MoviesGridComponent } from "../shared/components/cards-grid/movies-grid/movies-grid.component";
import { CustomSelectComponent } from "../shared/components/elements/custom-select/custom-select.component";
import { DatePipe, NgOptimizedImage, DecimalPipe } from '@angular/common';
import { AutoImagePipe } from "../shared/pipes/autoimage/auto-image.pipe";
import { IconComponent } from '../shared/icon/icon.component';
import { Genre } from '../core/interfaces/shared/genre.interface';
import { MinutesToTimePipe } from "../shared/pipes/minutes-to-time/minutes-to-time.pipe";
import { TooltipDirective } from "../core/directives/tooltip/tooltip.directive";
import { RouterLink } from '@angular/router';
import { FloatTrailerService } from '../core/services/float-trailer/float-trailer.service';
import { getKeyTrailer } from '../shared/utils/helpers';

@Component({
  selector: 'app-movies',
  imports: [
    NgOptimizedImage,
    BackgroundNavScrollDirective,
    CustomSelectComponent,
    AutoImagePipe,
    DatePipe,
    MinutesToTimePipe,
    IconComponent,
    DecimalPipe,
    TooltipDirective,
    RouterLink,
    MoviesGridComponent
  ],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export default class MoviesComponent {

  readonly api = inject(ApiService);
  private readonly floatTrailer = inject(FloatTrailerService);

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

  readonly currentTrailerKey = computed(() => {
    const currentMovie = this.selectedMovie()
    if (!currentMovie) return undefined
    return getKeyTrailer(currentMovie.videos)
  });

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

  selectGenre(genre: Genre) {
    if (genre.id === this.selectedGenre().id) return
    this.selectedGenre.set(genre)
  }

  filterByList(option: OptionMovie) {

    const apiMethod = this.api.methodMap[option.value]
    if (!apiMethod) throw new Error(`Unknown data type: ${option.value}`);

    apiMethod().subscribe((movies: MovieList) => {
      this.movies.set(movies)
      requestAnimationFrame(()=>this.moviesGrid().selectMovie(this.moviesGrid().data()[0], 0))
    })
  }

  playTrailer(): void {
    this.floatTrailer.showFloatTrailer(this.currentTrailerKey())
  }
}
