import { ElementRef, inject, NgZone, Renderer2 } from "@angular/core"
import Swiper from "swiper"
import { SwiperContainer } from "swiper/element";
import { FreeMode, Mousewheel } from "swiper/modules";
import { SwiperOptions } from "swiper/types";
import { take } from "rxjs";
import { DOCUMENT } from "@angular/common";
import { Movie, MovieList } from "../../core/interfaces/movie/movie.interface";
import { SerieList, Serie } from "../../core/interfaces/serie/serie.interface";

var timeouts: number[] = []
var animationsID: number[] = []

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
    return new Promise<HTMLElement>(resolve => {
        const onEnd = () => {
            console.log('ftransicion ftferminada', element.offsetWidth)
            element.removeEventListener('transitionend', onEnd)
            resolve(element);
        }
        element.addEventListener('transitionend', onEnd, { once: true })
    })
}

export function getKeyTrailer(index: number, data: MovieList | SerieList | undefined): string {
    if (data?.results[index] === undefined) return ''
    const trailer = data?.results[index].videos?.results.find((element: any) => element.type === 'Trailer');
    const key = trailer?.key || '';
    return key;
}

export function getKeyTrailerOf(data: Movie | Serie | undefined): string {
    if (data === undefined) return ''
    const trailer = data?.videos?.results.find((element: any) => element.type === 'Trailer');
    const key = trailer?.key || '';
    return key;
}

export function scrollToTop() {
    const ngZone = inject(NgZone);
    const doc = inject(DOCUMENT);

    ngZone.onStable.pipe(take(1)).subscribe(() => {
        const el = doc.scrollingElement || doc.documentElement || doc.body;
        if ('scrollTo' in el) {
            (el as HTMLElement).scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
    });
}
export function createChunks(data: Serie[], chunkSize: number) {
    const newChunks: typeof data[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
        newChunks.push(data.slice(i, i + chunkSize));
    }
    return newChunks
}

export function handleCardHover(
  event: MouseEvent, 
  index: number, 
  spaceBetween: number, 
  timeoutDelay = 300
) {
  const child = event.target as HTMLElement;
  const parent = child.parentElement as HTMLElement;
  if (!child || !parent) return;

  startTimeOut(() => {
    if (index > 1) {
      parent.scrollLeft = (child.offsetLeft + Math.floor(child.offsetWidth * 2.8)) 
                           - parent.clientWidth - spaceBetween;
    }
  }, timeoutDelay);
}

export function resetCardHover(event: MouseEvent) {
  clearAllTimeouts();
  const child = event.target as HTMLElement;
  const parent = child.parentElement as HTMLElement;
  if (!child || !parent) return;
  parent.scrollLeft = 0;
}



