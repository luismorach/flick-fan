import { ElementRef } from "@angular/core";
import Swiper from "swiper";
import { SwiperContainer } from "swiper/element";
import { SkeletonSlidesHook } from "../../use-skeleton-slides";

export class SwiperValidators {
    static validateContainer(container: ElementRef<SwiperContainer> | undefined | null): void {
        if (!container?.nativeElement) {
            throw new Error('Swiper container is not available');
        }

        if (!(container.nativeElement instanceof HTMLElement)) {
            throw new Error('Swiper container is not a valid HTML element');
        }

    }

    static validateSwiper(swiper: Swiper | undefined | null): void {
        if (!swiper) {
            throw new Error('Swiper instance is not initialized');
        }

        if (swiper.destroyed) {
            throw new Error('Swiper instance has been destroyed');
        }

        if (!swiper.slides || swiper.slides.length === 0) {
            throw new Error('Swiper instance has no slides');
        }
    }

    static validateSlidesInfo(slidesInfo: SkeletonSlidesHook | undefined | null): void {
        if (!slidesInfo) {
            throw new Error('SlidesInfo is null or undefined');
        }

        if (typeof slidesInfo !== 'object' || slidesInfo === null) {
            throw new Error('Slides configuration must be a valid object');
        }

        if (typeof slidesInfo.skeletonSlideIndexes !== 'function') {
            throw new Error('Slides configuration is missing skeletonSlideIndexes function');
        }

        try {
            const slides = slidesInfo.skeletonSlideIndexes();
            if (!Array.isArray(slides)) {
                throw new Error('skeletonSlideIndexes must return an array');
            }
        } catch (error) {
            throw new Error(`Slides configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static validateIndex(index: number, maxIndex?: number): void {
        if (!Number.isInteger(index) || index < 0) {
            throw new Error(`Invalid slide index: ${index}. Must be a non-negative integer`);
        }
        if (maxIndex !== undefined && index > maxIndex) {
            throw new Error(`Slide index ${index} exceeds maximum index ${maxIndex}`);
        }
    }
}