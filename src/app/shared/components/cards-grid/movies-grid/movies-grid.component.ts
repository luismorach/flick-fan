import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Movie, MovieList } from '../../../../core/interfaces/movie/movie.interface';
import { DataLoaderManager } from '../../../utils/data-loader-manager';
import { GridHelperService } from '../../../../core/services/grid-helper/grid-helper.service';
import { ScrollConfigService } from '../../../../core/services/scroll-config/scroll-config.service';
import { useSkeletonSlides } from '../../../utils/use-skeleton-slides';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CardMovieComponent } from '../../carousel/carousel-movies/card-movie/card-movie.component';
import { CarouselSkeletonComponent } from '../../carousel/carousel-movies/carousel-skeleton/carousel-skeleton.component';
import { fade } from '../../../animations/animations';
import { NgTemplateOutlet } from '@angular/common';

/**
 * Dynamic grid component for displaying movies with infinite scroll or manual loading.
 *
 * @input data - Initial movie list signal value
 * @input type - Display mode: 'scroll' (infinite), 'movies'/'all' (button), 'series'
 * @input searchQuery - Search query for filtering
 * @input genreId - Genre filter ID
 *
 * @remarks
 * - Provides independent DataLoaderManager instance
 * - Uses effect internally for reactive data synchronization
 * - Supports both infinite scroll and manual "load more" modes
 */

@Component({
  selector: 'app-movies-grid',
  imports: [InfiniteScrollDirective, CardMovieComponent, CarouselSkeletonComponent, NgTemplateOutlet],
  providers: [DataLoaderManager],
  templateUrl: './movies-grid.component.html',
  styleUrl: './movies-grid.component.css',
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesGridComponent {
  /** Fixed width for skeletons (in pixels) */
  private readonly SKELETON_SLIDE_WIDTH = 320;

  /**
 * Initial movie data.
 *
 * @input
 * @required
 * @type {MovieList | undefined}
 * @example
 * ```html
 * <app-movies-grid [data]="movieListSignal()" />
 * ```
 */

  readonly data = input.required<MovieList | undefined>()

  /**
    * Display mode.
   *
   * @input
   * @type {'scroll' | 'movies' | 'all'}
   * @default 'scroll'
   */
  readonly type = input<'scroll' | 'movies' | 'all' | 'series'>('scroll');

  /**
   * Search query for filtering results.
   * passed to loadMoreData() in 'series'/'all' modes.
   * @input
   * @type {InputSignal<string>}
   * @default ''
   *
   */
  readonly searchQuery = input<string>('')

  /**
   * Genre ID for client-side filtering (0 = no filter).
   * @input
   * @type {InputSignal<number>}
   * @default 0
   *
   */
  readonly genreId = input<number>(0)

  /** Data manager with internal effect for reactivity */
  readonly dataLoaderManager: DataLoaderManager<Movie> = inject(DataLoaderManager<Movie>);
  readonly scrollConfig = inject(ScrollConfigService);
  readonly gridHelper = inject(GridHelperService);
  readonly slides = useSkeletonSlides(this.SKELETON_SLIDE_WIDTH);

  /**
 * Dynamic CSS classes for each card.
 *
 * @type {Signal<string[]>}
 * @description
 * Returned by `gridHelper.cardClassesMovies()` → it is a `computed` that updates
 * automatically when `dataLoaderManager.data()` changes.
 */
  readonly cardClasses = this.gridHelper.cardClassesMovies(this.dataLoaderManager.data, this.slides)

  constructor() {
    /**
 * Pass the full signal (not the value) so that DataLoaderManager
 * uses `effect(() => signal())` and reacts to changes.
 */

    this.dataLoaderManager.setupDataSource(this.data, this.genreId)
  }
}
