import { inject, signal } from "@angular/core";
import { PaginatedMetaData } from "../../../../core/interfaces/shared/generic.interface";
import { ParamsApi } from "../../../../core/interfaces/shared/params-http.interface";
import { ApiService } from "../../../../core/services/API/api.service";
import { AnyEnhancedLoader, ArrayKey, LoaderCore, LoaderWithPagination, PAGINATION } from "../types";

export function withPagination<T extends PaginatedMetaData, R extends ArrayKey<T>>(loader: AnyEnhancedLoader<T, R>): LoaderWithPagination<T, R> {
    const api = inject(ApiService)
    const isFetchingMoreData = signal(false)

    const loadMoreData = async (params: ParamsApi = {}): Promise<void> => {
        const data = loader.mutableData();

        console.log('entre a consultar mas data', data)
        if (!data || !canLoadMore()) return;

        console.log('consultando mas data hook totalpage', data.total_pages)
        params.page = data.page+1;
        params.type = data.type;
        isFetchingMoreData.set(true);

        try {
            const nextPage = await api.fetchNextPage<T>(params);
            const test = ((nextPage[loader.dataKey] as any[]) || []).slice(0, 2)

            loader.mutableData.update((prev): T | undefined => {
                if (!prev) return prev
                const oldItems = prev[loader.dataKey];
                const arrayOldItems = Array.isArray(oldItems) ? oldItems : [];
                const newItems = nextPage[loader.dataKey];
                const arrayNewItems = Array.isArray(newItems) ? newItems : [];

                return {
                    ...prev,
                    page: nextPage.page,
                    total_pages: nextPage.total_pages,
                    total_results: nextPage.total_results,
                    [loader.dataKey]: [...arrayOldItems, ...arrayNewItems],
                    //[loader.dataKey]: [...arrayOldItems, ...test],
                } as T;
            })
        } finally {
            isFetchingMoreData.set(false);
        }
    }

    const canLoadMore = (): boolean => {
        const data = loader.mutableData();
        if (!data) return false;
        return data.page > 0
            && data.total_pages > 0
            && data.page < data.total_pages
            && !isFetchingMoreData();
    }

    loader.capabilities.add(PAGINATION);
    return {
        ...loader,
        isFetchingMoreData: isFetchingMoreData.asReadonly(),
        loadMoreData,
        canLoadMore,
    }
}

export function hasPagination<T extends object, K extends keyof T>
    (
        loader: LoaderCore<T, K> | undefined
    ): loader is LoaderWithPagination<T, K> {
    return !!loader && loader.capabilities.has(PAGINATION);
}