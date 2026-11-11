import { DestroyRef, effect, ElementRef, inject, Signal } from "@angular/core";
import { PaginatedMetaData } from "../../../../core/interfaces/shared/generic.interface";
import { ArrayKey, LoaderCore, INFINITE_SCROLL, LoaderWithPagination, LoaderWithInfiniteScroll, PAGINATION } from "../types";
import { withPagination } from "./with-pagination";

export function withInfiniteScroll<T extends PaginatedMetaData, R extends ArrayKey<T>>
    (loader: LoaderCore<T, R>): LoaderWithPagination<T, R> & LoaderWithInfiniteScroll<T, R> {

    const pagination = withPagination(loader)

    const setupInfiniteScroll = (sentinel: readonly ElementRef<HTMLElement>[],
        container?: ElementRef<HTMLElement>) => {

        console.trace('setupInfiniteScroll');
        let io: IntersectionObserver | undefined = undefined
        const containerEl = container?.nativeElement ?? null;
        const sentinelEl = sentinel[0]?.nativeElement
        console.log('infinite scroll', containerEl, sentinelEl)
        io = createIntersectionObserver(containerEl, pagination)
        io.observe(sentinelEl)
        return () => io.disconnect()
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
    console.log('createIntersectionObserver', root)
    return new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        const entry = entries[0]
        if (!entry) return;
        if (!entry.isIntersecting) return
        if (!loader.canLoadMore()) return
        if (loader.isFetchingMoreData()) return
        console.log({
            '¿Está intersectando?': entry.isIntersecting,
            'Porcentaje visible': entry.intersectionRatio,
            'Rectángulo del elemento': entry.boundingClientRect
        });
        loader.loadMoreData()
    },
        {
            root: root,
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
