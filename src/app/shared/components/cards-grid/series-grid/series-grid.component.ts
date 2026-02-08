import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, signal, viewChild, viewChildren } from '@angular/core';
import { useSlidesInfo } from '../../../utils/use-slides-info';
import { Serie, SerieList } from '../../../../core/interfaces/serie/serie.interface';
import { CardSerieComponent } from '../../carousel/carousel-series/card-serie/card-serie.component';
import { CarouselSeriesSkeletonComponent } from '../../carousel/carousel-series/carousel-series-skeleton/carousel-series-skeleton.component';
import { fade } from '../../../animations/animations';
import { NgTemplateOutlet } from '@angular/common';
import { slidesConfig } from '../../../../core/interfaces/shared/carousel-interface';
import { useSlideExpansion } from '../../../utils/use-slide-expansion';
import { useDataLoader } from '../../../utils/data-loaders/use-data-loader';
import { hasPagination, withPagination } from '../../../utils/data-loaders/enhancers/with-pagination';
import { ParamsApi } from '../../../../core/interfaces/shared/params-http.interface';
import { LoaderWithPagination } from '../../../utils/data-loaders/types';

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
  imports: [CardSerieComponent, CarouselSeriesSkeletonComponent, NgTemplateOutlet],
  providers: [],
  templateUrl: './series-grid.component.html',
  styleUrl: './series-grid.component.css',
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  readonly loader = useDataLoader<SerieList, 'results'>('results', this.data).pipe(
    withPagination
  )


  /** Helper for grid layout and hover effects */
  readonly slideExpansion = useSlideExpansion()

  /** Skeleton slide configuration for loading states */
  private readonly container = viewChild<ElementRef<HTMLElement>>('container')

  readonly cardsConfig: slidesConfig = {
    slidesPerView: 1,
    peekSkeletonOffset: 0,
    peek: 24,
    spaceBetween: 24,
    expandedSlideMultiplier: 2.6,
    breakpoints: {
      508: { slidesPerView: 2, },
      748: { slidesPerView: 3, peek: 32 },
      988: { slidesPerView: 4, peek: 44 },
      1388: { slidesPerView: 5 }
    }
  }

  readonly slidesInfo = useSlidesInfo(this.container, this.cardsConfig);

  /** 
   * Horizontal chunks of series for row-based layout.
   * Updates when data or slidesPerView changes.
   */
  readonly chunks = this.slideExpansion.createChunks<Serie>(this.loader.data,
    this.slidesInfo.layout().slidesPerView)

  constructor() {
    
    //this.dataLoaderManager.setupDataSource(this.data, this.genreId)
  }

  readonly isFetchingMoreData = computed(() => {
    if (hasPagination(this.loader))
      return this.loader.isFetchingMoreData()
    else
      return false

  })

  canLoadMore() {
    return hasPagination(this.loader) && this.loader.canLoadMore()
  }
  loadMoreData(params: ParamsApi = {}) {
    if (hasPagination(this.loader) && this.loader.canLoadMore())
      this.loader.loadMoreData(params)
  }

}
