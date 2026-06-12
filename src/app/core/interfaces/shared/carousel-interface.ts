import { ElementRef, Signal } from "@angular/core";
import { SlidesInfoHook } from "../../../shared/utils/use-slides-info";

export type Breakpoints<T> = {
    [width: number]: T;
};

export interface CarouselOptions {
    slidesConfig: slidesConfig;
    requiresEnrichment?: boolean;
    orientation?: 'horizontal' | 'vertical';
    slidesPerGroup?: number;
    centeredSlides?: boolean;
    requireSnapMandatory?: boolean
}

export interface slidesConfig {
    peek?: number;
    slidesOffsetBefore?: number;
    slidesOffsetAfter?: number;
    spaceBetween?: number;
    slidesPerView?: number;
    containerOrientation?: 'horizontal' | 'vertical';
    skeletonCount?: number;
    peekSkeletonOffset?: number;
    expandedSlideMultiplier?: number;
    centeredSlides?: boolean;
    aspectRatio?: number;
    maxScale?: number;
    breakpoints?: Breakpoints<slidesConfig>;

}

