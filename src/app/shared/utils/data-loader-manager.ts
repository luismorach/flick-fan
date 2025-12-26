import { computed, DestroyRef, effect, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Movie } from '../../core/interfaces/movie/movie.interface';
import { Serie } from '../../core/interfaces/serie/serie.interface';
import { ApiService } from '../../core/services/API/api.service';
import { PaginatedData } from '../../core/interfaces/shared/generic.interface';
import { ParamsApi } from '../../core/interfaces/shared/params-http.interface';
import { IntersectionObserverManager } from './intersectionObserver';


/**
 * Manages paginated data loading with loading state and optional genre filtering.
 * 
 * @remarks
 * This service should be provided at component level to ensure independent instances.
 * Call setupDataSource() before using other methods.
 * 
 * @example
 * ```typescript
 * @Component({
 *   providers: [DataLoaderManager]
 * })
 * export class MoviesComponent {
 *   private loader = inject(DataLoaderManager<Movie>);
 *   
 *   ngOnInit() {
 *     this.loader.setupDataSource(this.movies$, this.selectedGenre$);
 *   }
 * }
 * ```
 */
@Injectable()
export class DataLoaderManager<T extends Movie | Serie> {

    // Public readonly state
    readonly isFetchingMoreData = signal(false);
    readonly data: Signal<T[]>;
    readonly hasData: Signal<boolean>;

    // Private state
    private readonly api: ApiService = inject(ApiService)
    private readonly destroyRef = inject(DestroyRef)
    private  readonly intersectionObserver = inject(IntersectionObserverManager<T>)
    private readonly mutableData: WritableSignal<PaginatedData<T> | undefined> = signal(undefined);
    readonly changeLength = computed(() => this.data().length)
    private activeGenreFilter?: Signal<number>;

    // Computed data
    readonly isInitialLoading = computed(() => this.mutableData() === undefined)
    private readonly filteredData = computed(() => {
        const data = this.mutableData()?.results ?? [];
        const genreId = this.activeGenreFilter?.() ?? 0;

        if (!genreId) return data;

        return data.filter(item =>
            item.genres.some(genre => genre.id === genreId)
        );
    });

    constructor() {
        this.data = this.filteredData;
        this.hasData = computed(() => this.data().length > 0);
    }

    /**
  * Configures the data source and optional genre filter.
  * 
  * @param dataSource - Signal containing paginated data
  * @param genreId - Optional signal for genre filtering
  * 
  * @remarks
  * Creates an internal copy of dataSource because InputSignals are readonly.
  * This allows loadMoreData() to append results without mutating the input.
  * Can be called multiple times to change data source (previous effect is cleaned up).
  */
    setupDataSource(dataSource: Signal<PaginatedData<T> | undefined>, genreId?: Signal<number>) {
        this.activeGenreFilter = genreId;
        const syncEffect = effect(() => {
            this.mutableData.set(dataSource());
        });
        this.destroyRef.onDestroy(() => syncEffect.destroy());
    }

    async loadMoreData(params: ParamsApi = {}): Promise<void> {

        if (!this.canLoadMore()) return;

        const current = this.mutableData();
        if (!current?.page || !current?.type) return;
        console.log('totalpage', current.total_pages)

        params.page = current.page +1 ;
        params.type = current.type;
        this.isFetchingMoreData.set(true);

        try {
            const nextPageData = await this.api.fetchNextPage<T>(params);
            const test = nextPageData.results.slice(0, 7)

            this.mutableData.set({
                ...current,
                page: nextPageData.page,
                total_pages: nextPageData.total_pages,
                total_results: nextPageData.total_results,
                results: [...current.results, ...nextPageData.results],
                //results: [...current.results, ...test],
            });
        } finally {
            requestAnimationFrame(() => {
                this.intersectionObserver.observeNewSlides()
                this.isFetchingMoreData.set(false);
            })

        }
    }

    setupIntersectionObserver(root: Element) {
        this.intersectionObserver.setupIntersectionObserver(root, this.mutableData)
    }

    canLoadMore(): boolean {
        const data = this.mutableData();
        return data !== undefined
            && data.page > 0
            && data.total_pages > 0
            && data.page < data.total_pages
            && !this.isFetchingMoreData();
    }

    /**
 * Gets current pagination information.
 */
    getPaginationInfo(): { current: number; total: number } | null {
        const data = this.mutableData();
        if (!data?.page || !data?.total_pages) return null;
        return { current: data.page, total: data.total_pages };
    }

    reset(): void {
        this.mutableData.set(undefined);
        this.activeGenreFilter = undefined;
        this.isFetchingMoreData.set(false);
    }
}