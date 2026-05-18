import { effect, ElementRef, Signal, signal } from "@angular/core";
import { slidesConfig } from "../../core/interfaces/shared/carousel-interface";

export interface mainAxisMetrics {
    width: number,
    height: number,
    windowsWidth:number
}
export function useResizeObserver(
    container: Signal<ElementRef<HTMLElement> | undefined>) {
    const mainAxisMetrics = signal<mainAxisMetrics>({
        width: 0,
        height: 0,
        windowsWidth:0,
    })
    let rafId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    effect((onCleanup) => {
        const containerRef = container();
        if (!containerRef?.nativeElement) return;

        onCleanup(() => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            resizeObserver?.disconnect();
            resizeObserver = null;
            rafId = null;
        });

        setupResizeObserver(containerRef)
    });

    const setupResizeObserver = (container: ElementRef<HTMLElement>) => {
        resizeObserver = new ResizeObserver(scheduleUpdate);
        resizeObserver.observe(container.nativeElement);

        updateViewportSize()
    }

    const scheduleUpdate: ResizeObserverCallback = () => {
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
            updateViewportSize()
            rafId = null;
        });
    }

    const updateViewportSize = () => {
        const containerEl = container()?.nativeElement;
        if (!containerEl) {
            mainAxisMetrics.set({
                width: 0,
                height: 0,
                windowsWidth:0,
            })
            return;
        }

        
        const containerWidth = containerEl.getBoundingClientRect().width || 0
        const containerHeight = containerEl.getBoundingClientRect().height || 0 
        const windowsWidth = window.innerWidth

        console.log('containerWidth',containerWidth)

        mainAxisMetrics.set({
            width: containerWidth,
            height: containerHeight,
            windowsWidth
        })
    }

    return mainAxisMetrics.asReadonly()
}
