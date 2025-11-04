import { ElementRef } from "@angular/core";
import Swiper from "swiper";
import { SwiperContainer } from "swiper/element";
import { SkeletonSlidesHook } from "../../use-skeleton-slides";
import assert from "assert";

export class SwiperValidators {
    static validateContainer(container: ElementRef<SwiperContainer> | undefined | null):
     asserts container is ElementRef<SwiperContainer>{
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

    static validateSlidesInfo(slidesInfo: SkeletonSlidesHook | undefined | null): boolean {
        return (!slidesInfo || typeof slidesInfo !== 'object' || slidesInfo === null) 
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