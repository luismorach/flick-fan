
export type Breakpoints<T> = {
    [width: number]: T;
};

export interface CarouselOptions {
    slidesConfig: slidesConfig;
    orientation?: 'horizontal' | 'vertical';
    slidesPerGroup?: number;
    requireSnapMandatory?: boolean
    requireAnimation?:boolean
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

