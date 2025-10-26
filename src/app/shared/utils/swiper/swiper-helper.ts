import {
    computed, DestroyRef, effect, ElementRef, inject, Injector, InputSignal, Renderer2, Signal, signal,
    WritableSignal
} from "@angular/core"
import Swiper from "swiper"
import { SwiperContainer } from "swiper/element"
import { Mousewheel, FreeMode } from "swiper/modules"
import { SwiperOptions } from "swiper/types"
import { ListenerManager } from "../listener-manager"
import { getCurrentTransition } from "../transition-manager"
import { SkeletonSlidesHook } from "../use-skeleton-slides"
import { SwiperValidators } from "./swiper-validators/swiper-validators"
import { MovieList } from "../../../core/interfaces/movie/movie.interface"
import { SerieList } from "../../../core/interfaces/serie/serie.interface"
import { DataLoaderManager } from "../data-loader-manager"

export class SwiperHelper<T extends MovieList | SerieList = MovieList | SerieList> {

    private readonly _atCarouselEnd = signal(false)
    readonly atCarouselEnd = this._atCarouselEnd.asReadonly()
    private readonly _atCarouselStart = signal(true)
    readonly atCarouselStart = this._atCarouselStart.asReadonly()
    readonly isFetchingMoreData!: Signal<boolean>
    private _localData!: WritableSignal<T | undefined>;
    readonly localData: Signal<T | undefined>;

    private _isHoveredOverCarousel = false
    get isHoveredOverCarousel() { return this._isHoveredOverCarousel }
    setHoverState(isHovered: boolean): void { this._isHoveredOverCarousel = isHovered }

    private renderer: Renderer2 = inject(Renderer2)
    private destroyRef = inject(DestroyRef);
    private readonly dataLoaderManager: DataLoaderManager = inject(DataLoaderManager)

    private swiperContainer!: ElementRef<SwiperContainer>
    private swiper!: Swiper
    private baseTranslatePosition = 0
    private shouldResetTranslate = false
    private raf: number | null = null;
    private listenerManager: ListenerManager
    private ANIMATION_DURATION = 300
    private isInitialized = false


    constructor(private readonly slidesInfo: SkeletonSlidesHook) {
        this.listenerManager = new ListenerManager(this.renderer)
        this.baseTranslatePosition = this.slidesInfo.spaceBetween()

        this._localData = signal<T | undefined>(undefined);
        this.localData = this._localData.asReadonly();
        this.isFetchingMoreData = this.dataLoaderManager.isFetchingMoreData.asReadonly()

        //this.setupReactiveUpdates()
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    initialize(
        swiperContainer: Signal<ElementRef<SwiperContainer> | undefined>,
        data: InputSignal<T | undefined>) {
        this.setupLocalDataEffect(data)
        this.setupDataLoadedEffect()
        this.setupSwiperContainerEffect(swiperContainer)
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
        //SwiperValidators.validateContainer(swiperContainer)
        this.swiperContainer = swiperContainer
        const swiperOptions = this.createSwiperOptions()

        Object.assign(this.swiperContainer.nativeElement, swiperOptions)
        this.swiperContainer.nativeElement.initialize()

        this.swiper = this.swiperContainer.nativeElement.swiper
        this.isInitialized = true
        this.setupEventListeners()
        this.setPaddingToSwiperContainer()
    }

    private createSwiperOptions(): SwiperOptions {
        const swiperOptions: SwiperOptions = {
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
        return swiperOptions
    }

    private setupReactiveUpdates(): void {
        this.slidesInfo.onSlidesChange(() => {
            this.changeSlidesPerGroup(this.slidesInfo.slidesPerView())
        });
    }

    private changeSlidesPerGroup(slidesPerGroup: number): void {
        this.ensureSwiperReady()
        this.swiperContainer.nativeElement.slidesPerGroup = slidesPerGroup
        this.scheduleUpdateSwiper()
    }

    setImportance(importance: InputSignal<number>): void {
        this.renderer.setAttribute(this.swiperContainer.nativeElement, 'style', `z-index:${importance()};`);
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
                this.swiper.enable()
            })

        this.listenerManager.listen(this.swiperContainer.nativeElement,
            'swiperslidechangetransitionstart', () => {
                this.swiper.disable()
            })
    }

    private handleSlideChange(detail: Swiper): void {
        this._atCarouselStart.set(detail.isBeginning)
        this._atCarouselEnd.set(detail.isEnd);
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
        if (!isEnd || !this._localData()) return

        this.dataLoaderManager.loadMoreData(this._localData)
        this._atCarouselEnd.set(false);
        this.scheduleUpdateSwiper();
    }

    // ==========================================
    // LAYOUT & PADDING
    // ==========================================

    private setPaddingToSwiperContainer(): void {
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
        if (this.swiper.isEnd) {
            this.swiperContainer.nativeElement.slidesOffsetAfter =
                this.slidesInfo.expandedSlideWidth() + this.slidesInfo.spaceBetween();
        }
    }

    private calculateAdjustedTranslate(slide: HTMLElement, viewportWidth: number): number {
        return viewportWidth -
            (slide.offsetLeft + this.slidesInfo.expandedSlideWidth() + this.slidesInfo.spaceBetween());
    }

    restoreBaseTranslate(): void {
        if (!this.shouldResetTranslate) return

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
    // INFINITE DATA
    // ==========================================


    /**
     * Configura la carga infinita de datos
     * @param data Signal con los datos actuales
     */
    setupInfiniteDataLoading(data: InputSignal<T | undefined>): void {
        // runInInjectionContext(this.injector, () => {
        this.setupDataLoadedEffect();
        this.setupLocalDataEffect(data)
        // });
    }

    private setupLocalDataEffect(data: InputSignal<T | undefined>,): void {
        const localDataEffect = effect(() => {
            this._localData?.set(data());
        });
        this.destroyRef.onDestroy(() => localDataEffect.destroy());
    }

    private setupDataLoadedEffect(): void {
        const dataLoadedEffect = effect(() => {
            if (this.localData() && this.isInitialized) {
                this.dataLoaderManager.completeFetch()
                this._atCarouselEnd.set(false);
                this.scheduleUpdateSwiper()
            }
        });
        this.destroyRef.onDestroy(() => dataLoadedEffect.destroy());
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
