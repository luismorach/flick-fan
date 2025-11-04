import {
    computed,
    DestroyRef, effect, ElementRef, inject, Injectable, InputSignal, Renderer2, Signal, signal,
    WritableSignal,
} from "@angular/core"
import Swiper from "swiper"
import { SwiperContainer } from "swiper/element"
import { Mousewheel, FreeMode } from "swiper/modules"
import { SwiperOptions } from "swiper/types"
import { ListenerManager } from "../listener-manager"
import { getCurrentTransition } from "../transition-manager"
import { SkeletonSlidesHook } from "../use-skeleton-slides"
import { SwiperValidators } from "./swiper-validators/swiper-validators"
import { DataLoaderManager } from "../data-loader-manager"
import { PaginatedData } from "../../../core/interfaces/shared/generic.interface"
import { Serie } from "../../../core/interfaces/serie/serie.interface"
import { Movie } from "../../../core/interfaces/movie/movie.interface"

@Injectable()
export class SwiperHelper<T extends Movie | Serie> {

    private renderer: Renderer2 = inject(Renderer2)
    private destroyRef = inject(DestroyRef);
    private readonly dataLoaderManager: DataLoaderManager<T> = inject(DataLoaderManager<T>)
    private slidesInfo?: SkeletonSlidesHook

    private readonly _atCarouselEnd = signal(false)
    readonly atCarouselEnd = this._atCarouselEnd.asReadonly()
    private readonly _atCarouselStart = signal(true)
    readonly atCarouselStart = this._atCarouselStart.asReadonly()
    readonly isFetchingMoreData!: Signal<boolean>
    readonly data: Signal<T[]> = this.dataLoaderManager.data;
    readonly hasData = this.dataLoaderManager.hasData
    readonly isInitialLoading = this.dataLoaderManager.isInitialLoading
    readonly currentElement: WritableSignal<T | undefined> = signal(undefined)

    private _isHoveredOverCarousel = signal(false)
    readonly isHoveredOverCarousel = this._isHoveredOverCarousel.asReadonly()

    private swiperContainer!: ElementRef<SwiperContainer>
    private swiper!: Swiper
    private baseTranslatePosition = 0
    private shouldResetTranslate = false
    private raf: number | null = null;
    private listenerManager: ListenerManager
    private ANIMATION_DURATION = 300
    private isInitialized = false

    constructor() {
        this.listenerManager = new ListenerManager(this.renderer)


        this.isFetchingMoreData = this.dataLoaderManager.isFetchingMoreData.asReadonly()

        //this.setupReactiveUpdates()
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    initialize(
        swiperContainer: Signal<ElementRef<SwiperContainer> | undefined>,
        data: InputSignal<PaginatedData<T> | undefined>,
        slidesInfo?: SkeletonSlidesHook) {

        if (slidesInfo) {
            this.slidesInfo = slidesInfo
            this.baseTranslatePosition = this.slidesInfo.spaceBetween()
        }
        this.dataLoaderManager.setupDataSource(data)
        this.setupDataLoadedEffect()
        this.setupSwiperContainerEffect(swiperContainer)
    }

    private setupDataLoadedEffect(): void {
        const dataLoadedEffect = effect(() => {
            if (this.data() && this.isInitialized) {
                this._atCarouselEnd.set(false);
                this.scheduleUpdateSwiper()
            }
        });
        this.destroyRef.onDestroy(() => dataLoadedEffect.destroy());
    }

    private setupSwiperContainerEffect(swiperContainer: Signal<ElementRef<SwiperContainer> | undefined>) {
        const swiperEffect = effect(() => {
            const swiperEl = swiperContainer()
            if (!swiperEl) return
            /**
            * IMPORTANTE: Usa requestAnimationFrame porque cuando este método se ejecuta,
            * el template acaba de cambiar de skeleton → swiper debido al @defer,
            * pero los slots (slides) aún no están completamente renderizados en el DOM.
            */
            requestAnimationFrame(() => {
                this.initSwiper(swiperEl)
            })
        });
        this.destroyRef.onDestroy(() => swiperEffect.destroy());
    }

    /**
     * Inicializa la instancia de Swiper
     * @param swiperContainer Referencia al elemento contenedor
    */
    initSwiper(swiperContainer: ElementRef<SwiperContainer>): void {
        this.swiperContainer = swiperContainer
        const swiperOptions = this.createSwiperOptions()

        Object.assign(this.swiperContainer.nativeElement, swiperOptions)
        this.swiperContainer.nativeElement.initialize()

        this.swiper = this.swiperContainer.nativeElement.swiper
        this.isInitialized = true
        console.log(this.data()[this.swiper.activeIndex])
                this.currentElement.set(this.data()[this.swiper.activeIndex])
        this.setupEventListeners()
        this.setPaddingToSwiperContainer()
    }

    private createSwiperOptions(): SwiperOptions {
        let swiperOptions: SwiperOptions = {}
        if (this.slidesInfo) {
            swiperOptions = {
                modules: [Mousewheel, FreeMode],
                slidesPerView: 'auto',
                allowTouchMove: false,
                slidesPerGroup: this.slidesInfo.slidesPerView(),
                spaceBetween: this.slidesInfo.spaceBetween(),
                slidesOffsetAfter: this.slidesInfo.spaceBetween(),
                slidesOffsetBefore: this.slidesInfo.spaceBetween(),
                freeMode: {
                    enabled: true,
                    momentum: false
                },
                observer: false,
                observeParents: false,
            }
        } else {
            swiperOptions = {
                speed: 500,
                slidesPerView: 1,
                slidesPerGroup: 1,
                allowTouchMove: true,
                pagination: {
                    enabled: true,
                    dynamicBullets: true,
                },
            }
        }

        return swiperOptions
    }

    private setupReactiveUpdates(): void {
        if (!this.slidesInfo) return
        this.slidesInfo.onSlidesChange(() => {
            if (!this.slidesInfo) return
            this.changeSlidesPerGroup(this.slidesInfo.slidesPerView())
        });
    }

    private changeSlidesPerGroup(slidesPerGroup: number): void {
        this.ensureSwiperReady()
        this.swiperContainer.nativeElement.slidesPerGroup = slidesPerGroup
        this.scheduleUpdateSwiper()
    }

    // ==========================================
    // EVENT HANDLING
    // ==========================================

    private setupEventListeners(): void {
        this.ensureSwiperReady()
        type SwiperEvent = CustomEvent<[Swiper]>
        this.listenerManager.listen(this.swiperContainer.nativeElement,
            'swiperslidechange', (event: SwiperEvent) => {
                const [detail] = event.detail;
                this.handleSlideChange(detail)
            })

        this.listenerManager.listen(this.swiperContainer.nativeElement,
            'swiperslidechangetransitionend', (event: SwiperEvent) => {
                this.baseTranslatePosition = event.detail[0].translate;
                this.swiper.allowSlideNext = true
            })

        this.listenerManager.listen(this.swiperContainer.nativeElement,
            'swiperslidechangetransitionstart', () => {
                this.swiper.allowSlideNext = false
            })

        const parent = this.swiperContainer.nativeElement.parentElement
        if (!parent) return

        this.listenerManager.listen(parent,
            'mouseenter', (event: SwiperEvent) => {
                this._isHoveredOverCarousel.set(true)
            })

        this.listenerManager.listen(parent,
            'mouseleave', (event: SwiperEvent) => {
                this._isHoveredOverCarousel.set(false)
            })
    }

    private handleSlideChange(detail: Swiper): void {
        this._atCarouselStart.set(detail.isBeginning)
        this._atCarouselEnd.set(detail.isEnd);
        this.currentElement.set(this.data()[detail.activeIndex])
        this.updateContainerPadding(detail.isEnd)
        this.loadMoreData(detail.isEnd)
    }

    private updateContainerPadding(isEnd: boolean): void {
        if (isEnd) {
            this.deletePaddingToSwiperContainer();
        } else {
            this.setPaddingToSwiperContainer();
        }
    }

    private loadMoreData(isEnd: boolean) {
        if (!isEnd || !this.data()) return

        this.dataLoaderManager.loadMoreData()
        this._atCarouselEnd.set(false);
        this.scheduleUpdateSwiper();
    }

    // ==========================================
    // LAYOUT & PADDING
    // ==========================================

    private setPaddingToSwiperContainer(): void {
        if (!this.slidesInfo) return
        console.log(this.slidesInfo.paddingX(), this.slidesInfo.spaceBetween(), this.slidesInfo.slidesPerView())
        const paddingX = this.slidesInfo.paddingX()
        this.renderer.setStyle(
            this.swiper.wrapperEl,
            'padding',
            `0px ${paddingX}px`
        )
    }

    private deletePaddingToSwiperContainer(): void {
        this.renderer.setStyle(
            this.swiper.wrapperEl,
            'padding',
            '0px'
        )
    }

    // ==========================================
    // TRANSLATE ADJUSTMENTS
    // ==========================================


    /**
     * Ajusta el translate cuando una slide se expande
     * Previene que la slide se corte en el viewport
     * @param index Índice de la slide
     */
    adjustTranslateForExpandedSlide(index: number): void {
        this.ensureSwiperReadyForIndex(index)

        const slide = this.swiper.slides[index]
        if (!slide) return

        this.swiper.disable()
        if (this.needsTranslateAdjustment(slide)) {
            this.applyTranslateAdjustment(slide);
        }
    }

    private needsTranslateAdjustment(slide: HTMLElement): boolean {
        if (!this.slidesInfo) return false
        const viewportWidth = this.swiperContainer.nativeElement.offsetWidth;
        return this.baseTranslatePosition +
            (slide.offsetLeft + this.slidesInfo.expandedSlideWidth()) > viewportWidth;
    }

    private applyTranslateAdjustment(slide: HTMLElement): void {
        const viewportWidth = this.swiperContainer.nativeElement.offsetWidth;

        this.adjustOffsetForEndSlides()

        const newTranslate = this.calculateAdjustedTranslate(slide, viewportWidth);
        this.swiper.translateTo(newTranslate, this.ANIMATION_DURATION);
        this.shouldResetTranslate = true;
    }

    private adjustOffsetForEndSlides(): void {
        if (!this.slidesInfo) return
        if (this.swiper.isEnd) {
            this.swiperContainer.nativeElement.slidesOffsetAfter =
                this.slidesInfo.expandedSlideWidth() + this.slidesInfo.spaceBetween();
        }
    }

    private calculateAdjustedTranslate(slide: HTMLElement, viewportWidth: number): number {
        if (!this.slidesInfo) return 0
        return viewportWidth -
            (slide.offsetLeft + this.slidesInfo.expandedSlideWidth() + this.slidesInfo.spaceBetween());
    }

    restoreBaseTranslate(): void {
        if (!this.shouldResetTranslate || !this.slidesInfo) return

        this.ensureSwiperReady()
        this.swiperContainer.nativeElement.slidesOffsetAfter = this.slidesInfo.spaceBetween()
        this.swiper.translateTo(this.baseTranslatePosition, this.ANIMATION_DURATION);
        this.shouldResetTranslate = false
    }

    // ==========================================
    // NAVIGATION
    // ==========================================

    goToNextSlide(): void {
        this.swiper.slideNext();
    }

    goToPrevSlide(): void {
        this.swiper.slidePrev();
    }

    // ==========================================
    // UTILS
    // ==========================================

    async updateSwiperAfterHoverTransition(): Promise<void> {
        try {
            const current = getCurrentTransition();
            if (!current) return

            const result = await current.promise;
            if (result.status === 'canceled') return

            this.scheduleUpdateSwiper(true)
        } catch (error) {
            this.scheduleUpdateSwiper(true);
            throw new Error('[SwiperHelper] Transition error', { cause: error });
        }
    }

    private scheduleUpdateSwiper(enableBefore = false): void {
        this.cancelUpdateSwiper()

        this.raf = requestAnimationFrame(() => {
            this.raf = null;
            this.ensureSwiperReady()

            if (enableBefore && !this.swiper.enabled) {
                this.swiper.enable();
            }

            this.swiper.update();
        });
    }

    private cancelUpdateSwiper(): void {
        if (this.raf !== null) {
            cancelAnimationFrame(this.raf);
            this.raf = null;
        }
    }

    private ensureSwiperReady(): void {
        SwiperValidators.validateContainer(this.swiperContainer);
        SwiperValidators.validateSwiper(this.swiper);
    }

    private ensureSwiperReadyForIndex(index: number): void {
        this.ensureSwiperReady();
        SwiperValidators.validateIndex(index);
    }

    destroy(): void {
        this.cancelUpdateSwiper()
        this.listenerManager.cleanupAll()
    }
}
