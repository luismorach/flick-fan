import { inject, NgZone } from "@angular/core"
import { take } from "rxjs";
import { DOCUMENT } from "@angular/common";
import { Movie, MovieList } from "../../core/interfaces/movie/movie.interface";
import { SerieList, Serie } from "../../core/interfaces/serie/serie.interface";
import { video } from "../../core/interfaces/media/videos.interface";

export function waitForAnimationFrame(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

export function getKeyTrailer(data: Movie | Serie | undefined): string {
    if (!data?.videos?.results || !Array.isArray(data.videos.results)) {
        return '';
    }
    return data.videos.results.find((v: video) => v.type === 'Trailer')?.key ?? '';
}

/**
 * Hace scroll suave al tope de la página
 * IMPORTANTE: Debe llamarse desde un contexto de inyección de Angular
 */
export function scrollToTop(): void {
    const ngZone = inject(NgZone);
    const doc = inject(DOCUMENT);

    ngZone.onStable.pipe(take(1)).subscribe(() => {
        const el = doc.scrollingElement || doc.documentElement || doc.body;
        if ('scrollTo' in el) {
            (el as HTMLElement).scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
    });
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

export function hasNextPage(data: MovieList | SerieList | undefined): boolean {
    if (!data) return false;
    const page = data?.page ?? 0;
    const totalPages = data?.total_pages ?? 0;
    return page > 0 && totalPages > 0 && page < totalPages;
}




