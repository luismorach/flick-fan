import { DestroyRef, effect, ElementRef, inject, Signal } from "@angular/core";
import { PaginatedMetaData } from "../../../../core/interfaces/shared/generic.interface";
import { ArrayKey, LoaderCore, INFINITE_SCROLL, LoaderWithPagination, LoaderWithInfiniteScroll, PAGINATION } from "../types";
import { withPagination } from "./with-pagination";

export function withInfiniteScroll<T extends PaginatedMetaData, R extends ArrayKey<T>>
    (loader: LoaderCore<T, R>): LoaderWithPagination<T, R> & LoaderWithInfiniteScroll<T, R> {

    const pagination = withPagination(loader)

    const setupInfiniteScroll = (sentinel: Signal<readonly ElementRef<HTMLElement>[] | undefined>,
        container?: Signal<ElementRef<HTMLElement> | undefined>) => {

        let io: IntersectionObserver | undefined = undefined
        const destroyRef = inject(DestroyRef);

        const cleanupRef = effect((onCleanup) => {
            const containerSignal = container?.();
            const containerEl = containerSignal?.nativeElement ?? null;
            const sentinelEl = sentinel()?.[0]?.nativeElement

            if (!sentinelEl) {
                io?.disconnect();
                io = undefined;
                return;
            }

            io?.disconnect()
            io = createIntersectionObserver(containerEl, pagination)
            io.observe(sentinelEl)
            
            onCleanup(() => {
                io?.disconnect()
                io = undefined
            })
        })

        destroyRef.onDestroy(() => {
            cleanupRef.destroy()
            io?.disconnect()
            io = undefined
        })
    }

    pagination.capabilities.add(INFINITE_SCROLL);
    pagination.capabilities.add(PAGINATION);

    return {
        ...pagination,
        setupInfiniteScroll
    }

}

function createIntersectionObserver<T extends PaginatedMetaData, R extends ArrayKey<T>>
    (root: HTMLElement | null, loader: LoaderWithPagination<T, R>) {
    return new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        const entry = entries[0]
        if (!entry) return;
        if (!entry.isIntersecting) return
        if (!loader.canLoadMore()) return
        if (loader.isFetchingMoreData()) return
        loader.loadMoreData()
    },
        {
            root:root,
            threshold: 0.1,
            rootMargin: '0px 0px 0px 0px'
        }
    );
}

export function hasInfiniteScroll<T extends object, K extends ArrayKey<T>>
    (
        loader: LoaderCore<T, K> | undefined
    ): loader is LoaderWithInfiniteScroll<T, K> {
    return !!loader && loader.capabilities.has(INFINITE_SCROLL);
}
