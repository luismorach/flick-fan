import { ElementRef} from "@angular/core"
import { Movie} from "../../core/interfaces/movie/movie.interface";
import { Serie } from "../../core/interfaces/serie/serie.interface";
import { video, Videos } from "../../core/interfaces/media/videos.interface";

export function waitForAnimationFrame(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

export function getKeyTrailer(videos:Videos): string |undefined {
    if (!videos?.results || !Array.isArray(videos.results)) {
        return undefined;
    }
    return videos.results.find((v: video) => v.type === 'Trailer')?.key ;
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




