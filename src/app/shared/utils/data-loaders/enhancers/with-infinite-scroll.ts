import { effect, ElementRef, Signal} from "@angular/core";
import { PaginatedMetaData } from "../../../../core/interfaces/shared/generic.interface";
import { ArrayKey, AnyEnhancedLoader, LoaderCore, INFINITE_SCROLL, LoaderWithPagination, LoaderWithInfiniteScroll } from "../types";
import { withPagination } from "./with-pagination";

export function withInfiniteScroll<T extends PaginatedMetaData, R extends ArrayKey<T>>
    (loader: AnyEnhancedLoader<T, R>): LoaderWithInfiniteScroll<T, R> {

    const pagination = withPagination(loader)

    const setupInfiniteScroll = (container: Signal<ElementRef<HTMLElement> | undefined>,
        sentinel: Signal<ElementRef<HTMLElement> | undefined>) => {

        let io: IntersectionObserver | undefined = undefined

        const cleanupRef = effect((onCleanup) => {
            const containerEl = container()?.nativeElement
            const sentinelEl = sentinel()?.nativeElement

            if (!containerEl || !sentinelEl) {
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

        return () => {
            cleanupRef.destroy()
            io?.disconnect()
            io = undefined
        }
    }

    pagination.capabilities.add(INFINITE_SCROLL);

    return {
        ...pagination,
        setupInfiniteScroll
    }

}

function createIntersectionObserver<T extends PaginatedMetaData, R extends ArrayKey<T>>
    (root: HTMLElement, loader: LoaderWithPagination<T, R>) {

    return new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        const entry = entries[0]
        if (!entry) return;
        if (!entry.isIntersecting) return
        if (!loader.canLoadMore()) return
        if (loader.isFetchingMoreData()) return
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
