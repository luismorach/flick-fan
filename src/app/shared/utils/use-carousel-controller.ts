import { computed, effect, ElementRef, Signal, signal, untracked } from "@angular/core";
import { CarouselOptions } from "../../core/interfaces/shared/carousel-interface";
import { SlidesInfoHook, useSlidesInfo } from "./use-slides-info";
import { hasPagination } from "./data-loaders/enhancers/with-pagination";
import { LoaderCore } from "./data-loaders/types";

export interface CarouselController {
    isAtEnd: Signal<boolean>
    isAtStart: Signal<boolean>
    isAtSkeleton: Signal<boolean>
    currentElement: Signal<any>
    currentPosition: Signal<number>
    slidesInfo: SlidesInfoHook
    activeIndex: Signal<number>
    scrollToCurrentPosition: () => void
    adjustScrollToNearestIndex: () => void
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
    carouselContainer: Signal<ElementRef<HTMLElement> | undefined>,
    carouselOptions: CarouselOptions,
    loader: LoaderCore<T, R> | undefined): CarouselController {

    const slidesInfo: SlidesInfoHook = useSlidesInfo(carouselContainer, carouselOptions.slidesConfig)

    const containerRef = computed(() => carouselContainer()?.nativeElement)
    const data = computed(() => (loader?.data() ?? []) as T[R] & any[])
    const activeIndex = signal(0);
    const isAtStart = computed(() => activeIndex() === 0)
    const isAtEnd = computed(() => activeIndex() + slidesPerGroup() >= totalVisibleItems())
    const isAtSkeleton = computed(() => activeIndex() >= data().length)

    const setupTraslate = () => {
        effect(() => {
            const position = currentPosition()
            console.log('moviendo carrusel', position, activeIndex(), slidesInfo.layout().slideMainAxisSizeWithGap
        ,slidesInfo.layout().slideMainAxisSize)
            scrollToCurrentPosition()
            //smoothScrollTo()
        })
    }
    setupTraslate()

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
        console.log('navigableSkeletonsCount', slidesInfo.visibleSkeletonsCount())

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
    const adjustScrollToNearestIndex = () => {
        const requireSnapMandatory = carouselOptions?.requireSnapMandatory ?? true
        const containerEl = containerRef()
        if (!containerEl || !requireSnapMandatory) return;

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
        console.log('avanxzando')

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
        const containerEl = containerRef()
        if (!containerEl) return;

        console.log('distancia a desplazar ', currentPosition(), slidesInfo.direction(), activeIndex())

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

    const smoothScrollTo = (duration = 400) => {
        const startTime = performance.now();
        const containerEl = containerRef();

        function animate(currentTime: any) {
            if (!containerEl) return;

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // easeInOut
            const ease = 0.5 - Math.cos(progress * Math.PI) / 2;

            containerEl.scrollLeft = currentPosition() * ease;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
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
        resetPosition
    }
}