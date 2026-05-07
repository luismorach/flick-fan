import { computed, DestroyRef, effect, ElementRef, inject, Signal, untracked } from "@angular/core"
import { PaginatedMetaData } from "../../../../core/interfaces/shared/generic.interface"
import { ArrayKey, AnyEnhancedLoader, LoaderWithPagination, LoaderCore, AUTO_FILL, LoaderWithAutoFill } from "../types"
import { hasPagination} from "./with-pagination"
import { canFilter } from "./with-filter"

export function withAutoFillViewport<T extends PaginatedMetaData, R extends ArrayKey<T>>
    (loader: AnyEnhancedLoader<T, R>): LoaderWithAutoFill<T, R> {

    const setupAutoFill = (sentinel: Signal<readonly ElementRef<HTMLElement>  [] | undefined>,
        container?: Signal<ElementRef<HTMLElement> | undefined>) => {

        if (!hasPagination(loader)) return 

        const destroyRef = inject(DestroyRef);
        const pagination = loader as unknown as LoaderWithPagination<T, R>;
        const data = computed(() => {
            return canFilter(pagination) ? pagination.filteredData() : pagination.data();
        })

        // Reacts to data changes and checks if more items should be loaded
        // to fill the viewport (autofill behavior)
        const cleanupRef = effect(() => {
            data()  // Explicit dependency on data to trigger the effect
            const containerEl = container ? container()?.nativeElement : document.scrollingElement
            const sentinelEl = sentinel()?.[0]?.nativeElement
            if (!containerEl || !sentinelEl) return
 
            untracked(() => {
                requestAnimationFrame(() => {
                    if (!pagination.canLoadMore() || pagination.isFetchingMoreData()) return;
                    const sentinelTop = sentinelEl.offsetTop;
                    const viewportBottom = containerEl.scrollTop + containerEl.clientHeight;

                    // Add 100px tolerance to trigger earlier (avoids stopping too close to the edge)
                    const needsMore = sentinelTop <= viewportBottom + 100;

                    if (needsMore) {
                        pagination.loadMoreData();
                    }
                })

            })
        })

        destroyRef.onDestroy(() => cleanupRef.destroy())
    }

    loader.capabilities.add(AUTO_FILL);
    return {
        ...loader,
        setupAutoFill,
    }
}

export function hasAutoFill<T extends object, K extends keyof T>
    (
        loader: LoaderCore<T, K> | undefined
    ): loader is LoaderWithAutoFill<T, K> {
    return !!loader && loader.capabilities.has(AUTO_FILL);
}