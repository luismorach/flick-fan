import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HandleCardSeries {
    private readonly EXPANDED_SLIDE_MULTIPLIER = 2.8;

    handleCardHover(card: HTMLElement, spaceBetween: number): void {
        if (!card?.parentElement) return;

        const parent = card.parentElement as HTMLElement;

        if (!this.isScrollableContainer(parent)) return;
        
        const viewportWidth = window.innerWidth
        const requiredScroll = this.calculateRequiredScrollPosition(card, spaceBetween)

        if (requiredScroll < viewportWidth) return

        parent.scrollLeft = requiredScroll - viewportWidth
    }

    private calculateRequiredScrollPosition(card: HTMLElement, spaceBetween: number): number {
        const expandedCardWidth = Math.floor(card.offsetWidth * this.EXPANDED_SLIDE_MULTIPLIER) + spaceBetween
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

}