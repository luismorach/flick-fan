import { ElementRef} from "@angular/core"
import { Movie} from "../../core/interfaces/movie/movie.interface";
import { Serie } from "../../core/interfaces/serie/serie.interface";
import { video } from "../../core/interfaces/media/videos.interface";

export function waitForAnimationFrame(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

export function getKeyTrailer(data: Movie | Serie | undefined): string |undefined {
    if (!data?.videos?.results || !Array.isArray(data.videos.results)) {
        return '';
    }
    return data.videos.results.find((v: video) => v.type === 'Trailer')?.key ;
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

export function createChunks<T>(data: T[], chunkSize: number): T[][] {
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




