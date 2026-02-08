import { Component, effect, inject, signal, viewChild, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/services/API/api.service';
import { CommonModule } from '@angular/common';
import { fade } from '../shared/animations/animations';
import { Genre } from '../core/interfaces/shared/genre.interface';
import { Movie, MovieList } from '../core/interfaces/movie/movie.interface';
import { Serie, SerieList } from '../core/interfaces/serie/serie.interface';
import { MoviesGridComponent } from "../shared/components/cards-grid/movies-grid/movies-grid.component";
import { SeriesGridComponent } from '../shared/components/cards-grid/series-grid/series-grid.component';
import { IconComponent } from '../shared/icon/icon.component';
import { EmptyComponent } from '../shared/components/empty/empty.component';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, of, switchMap } from 'rxjs';
import { LoaderCore } from '../shared/utils/data-loaders/types';

@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    MoviesGridComponent,
    SeriesGridComponent,
    IconComponent,
    EmptyComponent,
    BackgroundNavScrollDirective,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
  animations: [fade]
})
export default class SearchComponent {

  private readonly api = inject(ApiService)
  private readonly route = inject(ActivatedRoute)

  readonly movies: WritableSignal<MovieList | undefined> = signal(undefined)
  readonly series: WritableSignal<SerieList | undefined> = signal(undefined)
  readonly genres: WritableSignal<Genre[] | undefined> = signal(undefined)

  private readonly moviesGrid = viewChild.required<MoviesGridComponent>(MoviesGridComponent)
  private readonly seriesGrid = viewChild.required<SeriesGridComponent>(SeriesGridComponent)
  readonly selectedGenreId = signal(0)

  selectedType = signal<'movies' | 'all' | 'series'>('all')
  readonly query = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => of(params.get('query') || ''))
    ),
    { initialValue: '' }
  );

  constructor() {
    this.loadGenres()
    this.setupSearchEffect()
  }

  loadGenres() {
    this.api.getGenres().subscribe((genres: Genre[]) => this.genres.set(genres))
  }

  private setupSearchEffect(): void {
    effect(() => {
      const searchQuery = this.query();

      if (!searchQuery?.trim()) {
        this.movies.set(undefined);
        this.series.set(undefined);
        return;
      }

      this.performSearch(searchQuery);
    });
  }

  private performSearch(query: string): void {
    this.movies.set(undefined);
    this.series.set(undefined);

    const movies$ = this.api.searchMovie({ page: 1, query });
    const series$ = this.api.searchSerie({ page: 1, query });

    forkJoin({ movies: movies$, series: series$ }).subscribe(results => {
      this.movies.set(results.movies);
      this.series.set(results.series);
    });
  }

  getDataLoaders() {
    const loaders: LoaderCore<MovieList | SerieList, 'results'>[] = [];

    if (this.selectedType() !== 'series') loaders.push(this.moviesGrid().loader);
    if (this.selectedType() !== 'movies') loaders.push(this.seriesGrid().loader);
    return loaders;
  }

  onChangeSelectValue(event: Event) {
    const target = event.target as HTMLSelectElement
    this.selectedGenreId.set(Number(target.value))
  }
}
