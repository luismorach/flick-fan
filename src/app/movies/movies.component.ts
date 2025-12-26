import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { ApiService } from '../core/services/API/api.service';
import BannerMoviesComponent from '../shared/components/banners/banner-movies/banner-movies.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { Movie, MovieList } from '../core/interfaces/movie/movie.interface';
import { forkJoin, of } from 'rxjs';
import { EmptyComponent } from '../shared/components/empty/empty.component';
import { MoviesGridComponent } from "../shared/components/cards-grid/movies-grid/movies-grid.component";
import { DataLoaderManager } from '../shared/utils/data-loader-manager';
import { PaginatedData } from '../core/interfaces/shared/generic.interface';

@Component({
  selector: 'app-movies',
  imports: [
    BannerMoviesComponent,
    BackgroundNavScrollDirective,
    EmptyComponent,
    MoviesGridComponent,
  ],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export default class MoviesComponent {

  private readonly api = inject(ApiService);
  readonly upcomingMovies = signal<MovieList | undefined>(undefined);
  readonly nowPlaying = signal<MovieList | undefined>(undefined);

  private readonly moviesGrid = viewChild.required<MoviesGridComponent>(MoviesGridComponent)
  private readonly bannerMovie = viewChild.required<BannerMoviesComponent>(BannerMoviesComponent)

  constructor() {
    //this.test()
    this.loadInitialData();
  }
  test(){
    const x={
      page:1,
      results:[],
      total_pages:0,
      total_results:0,
      type:''
    }
    this.nowPlaying.set(x as MovieList)
    this.upcomingMovies.set(x as MovieList)
  }

  private loadInitialData(): void {
    forkJoin({
      nowPlaying: this.api.getNowPlaying({ page: 1 }),
      upcoming: this.api.getUpcoming({ page: 1 })
    }).pipe(
      takeUntilDestroyed(),
    ).subscribe(({ nowPlaying, upcoming }) => {
      this.nowPlaying.set(nowPlaying);
      this.upcomingMovies.set(upcoming);
    });
  }

  getDataLoaders() {
    const loaders: DataLoaderManager<Movie>[] = [];

    loaders.push(this.moviesGrid().dataLoaderManager);
    loaders.push(this.bannerMovie().carouselService.dataLoaderManager);
    return loaders;
  }
}
