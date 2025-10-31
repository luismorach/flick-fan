import { ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import { fade } from '../shared/animations/animations';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/services/API/api.service';
import BannerMovieComponent from '../shared/components/banner-movie/banner-movie.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';
import { MovieList } from '../core/interfaces/movie/movie.interface';
import { forkJoin } from 'rxjs';
import { EmptyComponent } from '../shared/components/empty/empty.component';
import { MoviesGridComponent } from "../shared/components/cards-grid/movies-grid/movies-grid.component";

@Component({
  selector: 'app-movies',
  imports: [
    BannerMovieComponent,
    CommonModule,
    BackgroundNavScrollDirective,
    EmptyComponent,
    MoviesGridComponent,
],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css',
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export default class MoviesComponent {

  private readonly api = inject(ApiService);
  readonly upcomingMovies = signal<MovieList | undefined>(undefined);
  readonly nowPlaying = signal<MovieList | undefined>(undefined);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    forkJoin({
      nowPlaying: this.api.getNowPlaying(1),
      upcoming: this.api.getUpcoming(1)
    }).pipe(
      takeUntilDestroyed(),
    ).subscribe(({ nowPlaying, upcoming }) => {
      this.nowPlaying.set(nowPlaying);
      this.upcomingMovies.set(upcoming);
    });
  }
}
