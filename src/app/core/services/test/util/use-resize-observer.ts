import { effect, ElementRef, Signal, signal } from "@angular/core";

export interface mainAxisMetrics {
    width: number,
    height: number,
    windowsWidth: number
}
export function useResizeObserver(container: ElementRef<HTMLElement> | undefined) {
    const containerEl = container?.nativeElement;
    const mainAxisMetrics = signal<mainAxisMetrics>({
        width: 0,
        height: 0,
        windowsWidth: 0,
    })

    if (!containerEl) return { mainAxisMetrics: mainAxisMetrics.asReadonly()}

    let rafId: number | null = null;

    const scheduleUpdate: ResizeObserverCallback = () => {
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
            updateViewportSize()
            rafId = null;
        });
    }

    const updateViewportSize = () => {
        const containerEl = container?.nativeElement;
        if (!containerEl) {
            mainAxisMetrics.set({
                width: 0,
                height: 0,
                windowsWidth: 0,
            })
            return;
        }


        const containerWidth = containerEl.getBoundingClientRect().width || 0
        const containerHeight = containerEl.getBoundingClientRect().height || 0
        const windowsWidth = window.innerWidth

        console.log('containerWidth', containerWidth)

        mainAxisMetrics.set({
            width: containerWidth,
            height: containerHeight,
            windowsWidth
        })
    }

    let resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(container.nativeElement);

    updateViewportSize()

    const cleanup = () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
    };

    return { mainAxisMetrics: mainAxisMetrics.asReadonly(), cleanup }
}
