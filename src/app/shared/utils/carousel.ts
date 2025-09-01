import { ElementRef, Renderer2 } from "@angular/core"
import Swiper from "swiper"
import { SwiperContainer } from "swiper/element";
import { FreeMode, Mousewheel } from "swiper/modules";
import { SwiperOptions } from "swiper/types";
import { listMovies, listSeries } from "../interfaces/interfaces";

var timeouts: number[] = []
export var animationsID: number[] = []

export function setOptionsToSwiperWhitMultiplesSlidesPerView(numSlides: number, spaceBetween: number) {
    const swiperOptions: SwiperOptions = {
        modules: [Mousewheel, FreeMode],
        slidesPerView: 'auto',
        allowTouchMove: false,
        initialSlide: 0,
        slidesPerGroup: numSlides,
        spaceBetween: spaceBetween,
        slidesOffsetAfter: spaceBetween,
        freeMode: {
            enabled: true,
            momentum: false
        },
        watchSlidesProgress: true,
        resistanceRatio: 0,
    }
    return swiperOptions
}
export function initSwiper(swiperContainer: ElementRef<SwiperContainer>, swiperOptions: SwiperOptions) {
    if (swiperContainer) {
        Object.assign(swiperContainer.nativeElement, swiperOptions)
        swiperContainer.nativeElement?.initialize()
    }
}

export function calculateNumSlides(containerWidth: number, slideWidth: number) {
    console.log(containerWidth)
    return Math.floor(containerWidth / slideWidth)
}

export function getRange(numSlides: number) {
    return Array.from({ length: numSlides }, (_, i) => i)
}

export function calculatePaddingToSetSwiperContainer(swiper: Swiper, spaceBetween: number) {
    let containerWidth = swiper.width
    let slideWidth = swiper.slides[0].offsetWidth
    let numSlides = calculateNumSlides(containerWidth, slideWidth)
    let usedWith = (numSlides * slideWidth) + (numSlides - 1) * spaceBetween
    let remainingSpace = containerWidth - usedWith
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

export function startTimeOut(callback: Function, delay: number) {
    const timeoutID = setTimeout(callback, delay)
    timeouts.push(timeoutID)
    return timeoutID
}
export function clearAllTimeouts() {
    timeouts.forEach((id) => clearTimeout(id))
    timeouts = []
}

export function startAnimationFrame(callback: Function) {
    const animationID = requestAnimationFrame(() => callback())
    animationsID.push(animationID)
    return animationID
}
export function clearAllAnimationsFrame() {
    console.log(animationsID)
    animationsID.forEach((id) => cancelAnimationFrame(id))
    animationsID = []
}
export function waitForAnimationFrame(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

export function waitForTransitionEnd(element: HTMLElement) {
    return new Promise<void>(resolve => {
        const onEnd = () => {
            console.log('ftransicion ftferminada', element.offsetWidth)
            element.removeEventListener('transitionend', onEnd)
            resolve();
        }
        element.addEventListener('transitionend', onEnd, { once: true })
    })
}

export function getKeyTrailer(index: number, data: listMovies | listSeries | undefined): string {
    if (data?.results[index] === undefined) return ''
    const trailer = data?.results[index].videos?.results.find((element: any) => element.type === 'Trailer');
    const key = trailer?.key || '';
    return key;
}


