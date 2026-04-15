import { effect, ElementRef, signal, Signal } from "@angular/core"
import { Movie } from "../../core/interfaces/movie/movie.interface";
import { Serie } from "../../core/interfaces/serie/serie.interface";
import { video, Videos } from "../../core/interfaces/media/videos.interface";
import { ListReleaseDates } from "../../core/interfaces/shared/release-dates.interface";
import { MediaItem, PaginatedMetaData } from "../../core/interfaces/shared/generic.interface";

export function waitForAnimationFrame(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

export function getKeyTrailer(videos: Videos): string | undefined {
    if (!videos?.results || !Array.isArray(videos.results)) {
        return undefined;
    }
    return videos.results.find((v: video) => v.type === 'Trailer')?.key;
}

export function validateElement(element: ElementRef | HTMLElement | undefined | null): void {
    if (!element) {
        throw new Error('Element must be provided, received null or undefined');
    }

    const nativeElement = element instanceof ElementRef ? element.nativeElement : element;

    if (!(nativeElement instanceof HTMLElement)) {
        throw new Error(`Element must be a valid HTMLElement, received: ${typeof nativeElement}`);
    }

    if (!nativeElement.isConnected) {
        console.warn('[TransitionManager] Element is not in the DOM');
    }

}

export function getHeightContainer(container: Signal<ElementRef<HTMLElement> | undefined>) {
    const height = signal(0);

    effect((onCleanup) => {
        const containerEl = container()?.nativeElement;
        if (!containerEl) return

        const updateHeight = () => {
            const newHeight = containerEl.scrollHeight;
            if (height() !== newHeight) {
                height.set(newHeight);
            }
        };

        const observer = new ResizeObserver(entries => {
            requestAnimationFrame(updateHeight)
        });

        observer.observe(containerEl);

        updateHeight()

        onCleanup(() => {
            observer.disconnect();
        });

    })

    return height.asReadonly()
}

export function getReleaseDate<T extends MediaItem>(data: T | undefined) {
    const media = data
    if (!media) return
    const list = media.release_dates.results.filter((element) => element.iso_3166_1 === 'US')
    if(list.length === 0) return
    const release_dates = list[0].release_dates.filter((element) => element.certification !== '')
    if(!release_dates) return
    return release_dates[0]
}




