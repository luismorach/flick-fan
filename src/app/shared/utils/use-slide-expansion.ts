import { Signal, computed } from "@angular/core"
import { Serie, SerieList } from "../../core/interfaces/serie/serie.interface"
import { SlidesInfoHook, SlidesInfoLayout } from "./use-slides-info"
import { Movie } from "../../core/interfaces/movie/movie.interface"

export function useSlideExpansion() {
    let slideExpandedWidth = 0
    let viewportWidth = 0
    let shouldResetTranslate = false
    let container!: HTMLElement
    let currentPosition !: number

    /**
    * Adjusts translate when a slide expands.
    * Prevents the expanded slide from being cut off in the viewport.
    * @param index - Index of the slide to expand
    */
    const adjustTranslateForExpandedSlide = (slide: HTMLElement, slidesInfo: SlidesInfoHook, position: number) => {
        const containerEl = slide.parentElement as HTMLElement ?? undefined
        if (!containerEl || !isScrollableContainer(containerEl)) return

        container = containerEl
        currentPosition = position
        viewportWidth = container.offsetWidth;

        slideExpandedWidth = slide.offsetLeft + slidesInfo.layout().expandedSlideSize +
            slidesInfo.layout().spaceBetween

        if ((slideExpandedWidth - currentPosition) > viewportWidth) {
            applyTranslateAdjustment();
        }
    }

    const isScrollableContainer = (container: HTMLElement): boolean => {
        const hasScrollableContent = container.scrollHeight > container.clientHeight;

        const style = getComputedStyle(container);
        const canScroll = style.overflowY === 'scroll' ||
            style.overflowY === 'auto' ||
            style.overflow === 'scroll' ||
            style.overflow === 'auto';

        return hasScrollableContent && canScroll;
    }

    const applyTranslateAdjustment = () => {
        const newTranslate = slideExpandedWidth - viewportWidth;
        container.scrollTo({ left: newTranslate, behavior: 'smooth' })
        shouldResetTranslate = true;
    }

    /**
     * Restores base translate position after collapsing a slide
     */
    const restoreBaseTranslate = () => {
        if (!shouldResetTranslate) return
        container.scrollTo({ left: currentPosition, behavior: 'smooth' })
        shouldResetTranslate = false
    }

    const canExpand = (activeIndex: number, cardIndex: number, slidesPerView: number) => {
        const lastSlideCanExpand = activeIndex + (slidesPerView - 1)
        return cardIndex >= activeIndex && cardIndex <= lastSlideCanExpand
    }

    /**
     * Divide un array en chunks de tamaño específico
     * @param data Array a dividir
     * @param chunkSize Tamaño de cada chunk (debe ser > 0)
     * @returns Array de arrays (chunks)
     * @throws Error si chunkSize <= 0
     * @example
     * createChunks([1,2,3,4,5], 2) // [[1,2], [3,4], [5]]
     */
    const createChunks = <T>(data: Signal<T[]>, chunkSize: number): Signal<T[][]> => {
        return computed(() => {
            if (chunkSize <= 0) {
                throw new Error('chunkSize must be greater than 0');
            }

            if (!Array.isArray(data()) || data().length === 0) {
                return [];
            }

            const chunks: T[][] = [];
            for (let i = 0; i < data().length; i += chunkSize) {
                chunks.push(data().slice(i, i + chunkSize));
            }
            return chunks;
        })
    }

    const trackByChunk = (chunk: Serie[]): string => {
        return chunk.map(s => s.id).join('-');
    }

    const cardClassesMovies = (movies: Signal<Movie[]>, slidesInfoLayout: Signal<SlidesInfoLayout>) => {
        return computed(() => {
            const currentMovies = movies();
            const layout = slidesInfoLayout();
            const slidesPerView = layout.slidesPerView;
            console.log('cambio layout', layout)
            return currentMovies.map((_, i) =>
                getCardOriginClass(i, slidesPerView)
            ) ?? []
        });
    }

    const getCardOriginClass = (index: number, slidesPerView: number): string => {
        const position = index % slidesPerView;
        if (slidesPerView === 1) return 'origin-center';
        if (position === 0) return 'origin-left';
        if (position === slidesPerView - 1) return 'origin-right';
        return 'origin-center';
    }

    return {
        canExpand,
        adjustTranslateForExpandedSlide,
        restoreBaseTranslate,
        createChunks,
        trackByChunk,
        cardClassesMovies,
        getCardOriginClass,
        isScrollableContainer
    }

}
