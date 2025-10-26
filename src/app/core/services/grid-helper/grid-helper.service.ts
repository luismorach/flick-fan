import { computed, Injectable, WritableSignal } from '@angular/core';
import { Serie, SerieList } from '../../interfaces/serie/serie.interface';
import { SkeletonSlidesHook } from '../../../shared/utils/use-skeleton-slides';
import { MovieList } from '../../interfaces/movie/movie.interface';

@Injectable({ providedIn: 'root' })
export class GridHelperService {

    handleCardHover(card: HTMLElement, slideInfo: SkeletonSlidesHook): void {
        if (!card?.parentElement) return;

        const parent = card.parentElement as HTMLElement;

        if (!this.isScrollableContainer(parent)) return;

        const viewportWidth = window.innerWidth
        const requiredScroll = this.calculateRequiredScrollPosition(card, slideInfo)

        if (requiredScroll < viewportWidth) return

        parent.scrollLeft = requiredScroll - viewportWidth
    }

    private calculateRequiredScrollPosition(card: HTMLElement, slideInfo: SkeletonSlidesHook): number {
        const expandedCardWidth = slideInfo.expandedSlideWidth() + slideInfo.spaceBetween()
        return card.offsetLeft + expandedCardWidth
    }

    private isScrollableContainer(element: HTMLElement): boolean {
        // Tiene contenido que excede el ancho visible
        const hasScrollableContent = element.scrollWidth > element.clientWidth;

        // Permite scroll horizontal
        const style = getComputedStyle(element);
        const canScroll = style.overflowX === 'scroll' ||
            style.overflowX === 'auto' ||
            style.overflow === 'scroll' ||
            style.overflow === 'auto';

        return hasScrollableContent && canScroll;
    }

    resetCardHover(card: HTMLElement): void {
        if (!card?.parentElement) return;
        const parent = card.parentElement as HTMLElement;
        parent.scrollLeft = 0;
    }

    trackByChunk(chunk: Serie[]): string {
        return chunk.map(s => s.id).join('-');
    }

    getChunks(data: WritableSignal<SerieList | undefined>, slidesPerView: number) {
        const series = data()?.results ?? [];
        return this.createChunks(series, slidesPerView);
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
    private createChunks<T>(data: T[], chunkSize: number): T[][] {
        if (chunkSize <= 0) {
            throw new Error('chunkSize must be greater than 0');
        }

        if (!Array.isArray(data) || data.length === 0) {
            return [];
        }

        const chunks: T[][] = [];
        for (let i = 0; i < data.length; i += chunkSize) {
            chunks.push(data.slice(i, i + chunkSize));
        }

        return chunks;
    }


    cardClassesMovies(movies:WritableSignal<MovieList | undefined>,slides: SkeletonSlidesHook) {
        return computed(() =>
            movies()?.results?.map((_, i) =>
                this.getCardOriginClass(i, slides)
            ) ?? []
        );
    }

    getCardOriginClass(index: number, slides: SkeletonSlidesHook): string {
        const position = index % slides.slidesPerView();
        const slidesPerView = slides.slidesPerView();
        if (slidesPerView === 1) return 'origin-center';
        if (position === 0) return 'origin-left';
        if (position === slidesPerView - 1) return 'origin-right';
        return 'origin-center';
    }

}