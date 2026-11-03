import { computed, effect, ElementRef, inject, Signal, signal, untracked } from "@angular/core";
import { hasPagination } from "../../../../shared/utils/data-loaders/enhancers/with-pagination";
import { LoaderCore } from "../../../../shared/utils/data-loaders/types";
import { CarouselOptions } from "../../../interfaces/shared/carousel-interface";
import { SlidesInfoHook, useSlidesInfo } from "./use-slides-info";
import { DeviceType } from "../../device/device-service.service";

export interface CarouselController {
    isAtEnd: Signal<boolean>
    isAtStart: Signal<boolean>
    isAtSkeleton: Signal<boolean>
    currentElement: Signal<any>
    currentPosition: Signal<number>
    slidesInfo: SlidesInfoHook
    activeIndex: Signal<number>
    scrollToCurrentPosition: () => void
    adjustScrollToNearestIndex: (device: DeviceType) => void
    snapBackIfOverscrolled: () => void
    next: () => void
    prev: () => void
    resetPosition: () => void
}

export type CarouselNavigationAPI =
    Pick<CarouselController, 'next' | 'prev' | 'resetPosition'>

export type CarouselStateAPI =
    Pick<CarouselController, 'activeIndex' | 'isAtEnd' | 'isAtStart' | 'currentElement' | 'isAtSkeleton' | 'currentPosition'>

export function useCarouselcontroller<T extends Object, R extends keyof T>(
    carouselContainer: ElementRef<HTMLElement>,
    carouselOptions: CarouselOptions,
    loader: LoaderCore<T, R> | undefined): CarouselController {

    const slidesInfo: SlidesInfoHook = useSlidesInfo(carouselContainer, carouselOptions.slidesConfig)
    const containerEl = carouselContainer.nativeElement
    const data = computed(() => (loader?.data() ?? []) as T[R] & any[])
    const activeIndex = signal(0);
    const isAtStart = computed(() => activeIndex() === 0)
    const isAtEnd = computed(() => activeIndex() + slidesPerGroup() >= totalVisibleItems())
    const isAtSkeleton = computed(() => activeIndex() >= data().length)

    const currentElement = computed(() => {
        const index = activeIndex();
        const element = data()[index]
        return element ?? null
    });

    const slidesPerGroup = computed(() => {
        if (!carouselOptions) return 1
        if (!carouselOptions.slidesPerGroup)
            return Math.floor(slidesInfo.layout().slidesPerView)
        return Math.floor(carouselOptions.slidesPerGroup)
    });

    const currentPosition = computed(() => {
        if (!carouselOptions) return 0
        const fullWidth = slidesInfo.layout().slideMainAxisSizeWithGap;
        const index = activeIndex();
        const position = (fullWidth * index)
        return Math.max(0, position); 
    })

    const navigableSkeletonsCount = computed(() => {
        const canLoadMore = hasPagination(loader) && loader.canLoadMore()
        if (!canLoadMore || !carouselOptions) return 0;

        return slidesInfo.visibleSkeletonsCount()
    });

    const totalVisibleItems = computed(() => {
        const length = data().length;
        return length + navigableSkeletonsCount();
    });



    /**
 * Adjusts scroll position to snap to the nearest slide index.
 * Only called on non-desktop devices for touch/swipe interactions.
 */
    const adjustScrollToNearestIndex = (device: DeviceType) => {
        const requireSnapMandatory = carouselOptions?.requireSnapMandatory ?? true
        if (!requireSnapMandatory || device === 'desktop') return;

        const scroll = slidesInfo.direction() === 'vertical'
            ? containerEl.scrollTop : containerEl.scrollLeft;

        const fullWidth = slidesInfo.layout().slideMainAxisSizeWithGap;
        const nearestIndex = Math.round(scroll / fullWidth);

        console.log('requireSnapMandatory', requireSnapMandatory, scroll, fullWidth, nearestIndex)

        const maxIndex = Math.max(0, totalVisibleItems() - slidesPerGroup());
        const validIndex = Math.max(0, Math.min(nearestIndex, maxIndex));
        activeIndex.set(validIndex);
    }

    const snapBackIfOverscrolled = () => {
        if (hasPagination(loader) && loader.canLoadMore()) return

        const maxAllowedIndex = Math.max(0, totalVisibleItems() - slidesPerGroup());
        const currentIndex = activeIndex();

        if (currentIndex <= maxAllowedIndex) return;
        activeIndex.set(maxAllowedIndex);
    }

    const next = () => {
        if (isAtEnd()) return;

        const maxIndex = totalVisibleItems() - slidesPerGroup();
        const nextIndex = Math.min(activeIndex() + slidesPerGroup(), maxIndex);

        activeIndex.set(nextIndex);
    }

    const prev = () => {
        if (isAtStart()) return;
        const prevIndex = Math.max(0, activeIndex() - slidesPerGroup());

        activeIndex.set(prevIndex);
    }

    const scrollToCurrentPosition = (behavior: ScrollBehavior = 'smooth', newPosition: number = currentPosition()) => {

        //console.log('distancia a desplazar ', currentPosition(), slidesInfo.direction(), activeIndex())

        if (slidesInfo.direction() === 'vertical') {
            containerEl.scrollTo({ top: newPosition, behavior });
        } else {
            containerEl.scrollTo({ left: newPosition, behavior });
        }
    }

    const resetPosition = () => {
        console.log('reseteando posicion')
        scrollToCurrentPosition('instant', 0)

    }

    return {
        activeIndex: activeIndex.asReadonly(),
        isAtEnd,
        isAtStart,
        slidesInfo,
        currentElement,
        isAtSkeleton,
        currentPosition,
        scrollToCurrentPosition,
        next,
        prev,
        adjustScrollToNearestIndex,
        snapBackIfOverscrolled,
        resetPosition,
    }
}