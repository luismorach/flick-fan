import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { MovieList } from '../../core/interfaces/movie/movie.interface';
import { SerieList } from '../../core/interfaces/serie/serie.interface';
import { ApiService } from '../../core/services/API/api.service';

type DataList = MovieList | SerieList;

/**
 * Manages paginated data loading with loading state.
 * Call completeFetch() from component effect when data renders.
 */
@Injectable({ providedIn: 'root' })
export class DataLoaderManager {

    readonly isFetchingMoreData: WritableSignal<boolean> = signal(false)
    private readonly api: ApiService = inject(ApiService)

    hasNextPage(data: DataList | undefined): boolean {
        if (!data) return false;
        const page = data.page ?? 0;
        const totalPages = data.total_pages ?? 0;
        return page > 0 && totalPages > 0 && page < totalPages;
    }

    private canLoadMore(data: DataList | undefined): boolean {
        return this.hasNextPage(data) && !this.isFetchingMoreData();
    }

    async loadMoreData(data: WritableSignal<DataList | undefined>): Promise<void> {
        if (!this.canLoadMore(data())) return;

        this.isFetchingMoreData.set(true);
        try {
            await this.api.getMoreData(data);
        } catch (error) {
            this.isFetchingMoreData.set(false);
            throw error;
        }

    }

    /** Call from component effect when new data has rendered */
    completeFetch(): void {
        this.isFetchingMoreData.set(false);
    }
}