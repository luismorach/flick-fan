import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { GridHelperService } from '../../../../core/services/grid-helper/grid-helper.service';
import { ScrollConfigService } from '../../../../core/services/scroll-config/scroll-config.service';
import { DataLoaderManager } from '../../../utils/data-loader-manager';
import { useSkeletonSlides } from '../../../utils/use-skeleton-slides';
import { Serie, SerieList } from '../../../../core/interfaces/serie/serie.interface';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CardSerieComponent } from '../../carousel/carousel-series/card-serie/card-serie.component';
import { CarouselSeriesSkeletonComponent } from '../../carousel/carousel-series/carousel-series-skeleton/carousel-series-skeleton.component';
import { fade } from '../../../animations/animations';
import { NgTemplateOutlet } from '@angular/common';

/**
 * Dynamic grid component for series with horizontal chunking and hover expansion.
 *
 * @example
 * ```typescript
 * // Infinite scroll
 * <app-series-grid [data]="series()" type="scroll" />
 * 
 * // Search with manual loading
 * <app-series-grid [data]="results()" [searchQuery]="query()" type="series" />
 * 
 * // Genre filtered
 * <app-series-grid [data]="series()" [genreId]="genreId()" type="all" />
 * ```
 */
@Component({
  selector: 'app-series-grid',
  imports: [InfiniteScrollDirective, CardSerieComponent,CarouselSeriesSkeletonComponent,NgTemplateOutlet],
  providers:[DataLoaderManager],
  templateUrl: './series-grid.component.html',
  styleUrl: './series-grid.component.css',
  animations:[fade],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class SeriesGridComponent {
  /** Fixed width for series skeleton loading cards (pixels) */
  private readonly SKELETON_SLIDE_WIDTH = 288;

  /**
   * Initial series data source.
   *
   * @input
   * @required
   * @type {SerieList | undefined}
   * @example
   * ```html
   * <app-series-grid [data]="serieListSignal()" />
   * ```
   */
  readonly data = input.required<SerieList | undefined>()
  
  /**
   * display mode
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

  /** Manages data loading, pagination, and filtering */
  readonly dataLoaderManager:DataLoaderManager<Serie> = inject(DataLoaderManager<Serie>);

  /** Infinite scroll configuration (distance, throttle) */
  readonly scrollConfig = inject(ScrollConfigService);

  /** Helper for grid layout and hover effects */
  readonly gridHelper = inject(GridHelperService);

  /** Skeleton slide configuration for loading states */
  readonly slides = useSkeletonSlides(this.SKELETON_SLIDE_WIDTH);

  /**
   * Horizontal chunks of series for row-based layout.
   * Updates when data or slidesPerView changes.
   */
  readonly chunks = this.gridHelper.createChunks<Serie>(this.dataLoaderManager.data, this.slides.slidesPerView())

  constructor() {
     /**
 * Pass the full signal (not the value) so that DataLoaderManager
 * uses `effect(() => signal())` and reacts to changes.
 */
this.dataLoaderManager.data()
    this.dataLoaderManager.setupDataSource(this.data,this.genreId)
  }
}
