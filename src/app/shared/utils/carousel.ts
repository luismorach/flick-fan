import { ElementRef, inject, Renderer2, RendererFactory2 } from "@angular/core"
import Swiper from "swiper"
import { SwiperContainer } from "swiper/element";
import { SwiperOptions } from "swiper/types";

export function initSwiper(swiperContainer: ElementRef<SwiperContainer>, numSlides: number, spaceBetween: number, title: string) {
    const swiperOptions: SwiperOptions = {
        speed: 800,
        slidesPerView: 'auto',
        allowTouchMove: false,
        observer: true,
        observeParents: true,
        watchSlidesProgress: true,
        initialSlide: 0,
        slidesPerGroup: numSlides,
        spaceBetween: spaceBetween,
        slidesOffsetAfter: spaceBetween,
        navigation: {
            enabled: true,
            nextEl: `.swiper-next-${title}`,
            prevEl: `.swiper-previous-${title}`,
        }
    }

    if (swiperContainer) {
        Object.assign(swiperContainer.nativeElement, swiperOptions)
        swiperContainer.nativeElement?.initialize()
    }
}

export function calculateNumSlides(containerWidth: number, slideWidth: number) {
    return Math.floor(containerWidth / slideWidth)
}

export function getRangeSlidesLoading(numSlides: number) {
    return Array.from({ length: numSlides + 1 }, (_, i) => i)
}

export function calculatePaddingToSetSwiperContainer(swiper: Swiper, spaceBetween: number) {
    let containerWidth = swiper.width
    let slideWidth = swiper.slides[0].offsetWidth
    let numSlides = calculateNumSlides(containerWidth, slideWidth)
    let usedWith = (numSlides * slideWidth) + (numSlides - 1) * spaceBetween
    let remainingSpace = containerWidth - usedWith
    console.log(swiper.slides[0])
    console.log(containerWidth,slideWidth,numSlides,usedWith)
    return Math.floor(Math.max(remainingSpace / 2, 0))

}

export function setPaddingToSwiperContainer(swiper: Swiper, spaceBetween: number, renderer2: Renderer2) {
    let paddingX = calculatePaddingToSetSwiperContainer(swiper, spaceBetween)
    console.log(paddingX)
    renderer2.setStyle(swiper.wrapperEl, 'padding', `0px ${paddingX}px`)
}

export function deletePaddingToSwiperContainer(swiper: Swiper, renderer2: Renderer2) {
    renderer2.setStyle(swiper.wrapperEl, 'padding', '0px')
}

export function setStylesToFirstSlide(swiper: Swiper, spaceBetween: number, renderer2: Renderer2) {
    let paddingX = calculatePaddingToSetSwiperContainer(swiper, spaceBetween)
    renderer2.setStyle(swiper.slides[0], 'margin-left', ((paddingX - spaceBetween) * -1) + 'px')
}
