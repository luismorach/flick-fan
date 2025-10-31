import { computed, DestroyRef, effect, inject, Injectable, InputSignal, Signal, signal, WritableSignal } from '@angular/core';
import { Movie, MovieList } from '../../core/interfaces/movie/movie.interface';
import { Serie, SerieList } from '../../core/interfaces/serie/serie.interface';
import { ApiService } from '../../core/services/API/api.service';
import { PaginatedData } from '../../core/interfaces/shared/generic.interface';


/**
 * Manages paginated data loading with loading state.
 * Call completeFetch() from component effect when data renders.
 */
@Injectable()
export class DataLoaderManager<T> {

    readonly isFetchingMoreData: WritableSignal<boolean> = signal(false)
    private readonly api: ApiService = inject(ApiService)
    private readonly destroyRef = inject(DestroyRef)
    private readonly localData: WritableSignal<PaginatedData<T> | undefined> = signal(undefined);
    readonly data = computed(() => (this.localData()?.results ?? []));
    readonly hasData = computed(() => this.data().length > 0);

    setupLocalData(data: Signal< PaginatedData<T> | undefined>) {
        const localDataEffect = effect(() => {
            this.localData.set(data());
        });
        this.destroyRef.onDestroy(() => localDataEffect.destroy());
    }

    async loadMoreData(): Promise<void> {

        if (!this.canLoadMore()) return;

        this.isFetchingMoreData.set(true);
        try {
            await this.api.getMoreData(this.localData);
        } finally {
            this.isFetchingMoreData.set(false);
        }
    }

    private canLoadMore(): boolean {
        return this.hasNextPage() && !this.isFetchingMoreData();
    }

    private hasNextPage(): boolean {
        const data = this.localData()
        if (!data) return false;
        const { page = 0, total_pages = 0 } = data;
        return page > 0 && total_pages > 0 && page < total_pages;
    }
}