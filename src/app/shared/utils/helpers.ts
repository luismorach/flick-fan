import { computed, effect, ElementRef, signal, Signal } from "@angular/core"
import { Movie } from "../../core/interfaces/movie/movie.interface";
import { video, Videos } from "../../core/interfaces/media/videos.interface";
import { MediaItem } from "../../core/interfaces/shared/generic.interface";
import { Serie } from "../../core/interfaces/serie/serie.interface";


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

export function getComputedCertification<T extends MediaItem>(data: Signal<T | undefined>) {
    return computed(() => {
        const currentData = data()
        return getCertification(currentData)
    })
}

export function getCertification<T extends MediaItem>(data: T | undefined) {
    const media = data
    if (!media) return
    const list = media.release_dates.results.filter((element) => element.iso_3166_1 === 'US')
    if (list.length === 0) return
    const certification = list[0].release_dates.filter((element) => element.certification !== '')
    if (!certification) return
    return certification[0]
}

export function isMovie(item: any): item is Movie {
    return 'title' in item
}



export function getComputedTitleImageUrl(media: Signal<Movie | Serie | undefined>) {
    return computed(() => {
        const currentMedia = media()
        const logos = currentMedia?.images?.logos;
        if (!logos?.length) return undefined
        return logos[0].file_path
    })
}

export function getComputedTitle(media: Signal<Movie | Serie | undefined>) {
    return computed(() => {
        const currentMedia = media();
        return getTitle(currentMedia)
    })
}

export function getTitle(media: Movie | Serie | undefined) {
    if (!media) return 'Unknown title'
    if (isMovie(media)) return media.title
    return media.name
}

export function getComputedReleaseDate(media: Signal<Movie | Serie | undefined>) {
    return computed(() => {
        const currentMedia = media();
        return getReleaseDate(currentMedia)
    })
}

export function getReleaseDate(media: Movie | Serie | undefined) {
    if (!media) return undefined
    if (isMovie(media)) return media.release_date
    return media.first_air_date
}