import {
    computed, DestroyRef, effect, ElementRef, inject, Injector, InputSignal, OutputEmitterRef, Renderer2,
    runInInjectionContext, signal, untracked
} from "@angular/core"
import Swiper from "swiper"
import { SwiperContainer } from "swiper/element"
import { Mousewheel, FreeMode } from "swiper/modules"
import { SwiperOptions } from "swiper/types"
import { hasNextPage } from "../helpers"
import { ListenerManager } from "../listener-manager"
import { getCurrentTransition } from "../transition-manager"
import { SkeletonSlidesHook } from "../use-skeleton-slides"
import { SwiperValidators } from "./swiper-validators/swiper-validators"
import { MovieList } from "../../../core/interfaces/movie/movie.interface"
import { SerieList } from "../../../core/interfaces/serie/serie.interface"
import { DataLoaderConfig} from "./types.ts/swiper.types"

export class SwiperHelper {

    private readonly _atCarouselEnd = signal(false)
    readonly atCarouselEnd = this._atCarouselEnd.asReadonly()
    private readonly _atCarouselStart = signal(true)
    readonly atCarouselStart = this._atCarouselStart.asReadonly()
    private readonly _isFetchingMoreData = signal(false)
    readonly isFetchingMoreData = this._isFetchingMoreData.asReadonly()
    private _isHoveredOverCarousel = false
    get isHoveredOverCarousel() { return this._isHoveredOverCarousel }
    private injector: Injector = inject(Injector)
    private renderer: Renderer2 = inject(Renderer2)
    private destroyRef = inject(DestroyRef);
    private swiperContainer!: ElementRef<SwiperContainer>
    private swiper!: Swiper
    private baseTranslatePosition = 0
    private shouldResetTranslate = false
    private raf: number | null = null;
    private expandedSlideWidth = computed(() =>
        Math.floor(this.slidesInfo.slideBaseWidth * SwiperHelper.CONFIG.EXPANDED_SLIDE_MULTIPLIER))
    private listenerManager: ListenerManager

    private static readonly CONFIG = {
        /**
        * Multiplicador para el ancho de slides expandidas
        * 2.8x = slide base + expansión visual + espaciado
        */
        EXPANDED_SLIDE_MULTIPLIER: 2.8,
        ANIMATION_DURATION: 300,
    } as const;

    private infiniteDataConfig?: DataLoaderConfig

    constructor(private readonly slidesInfo: SkeletonSlidesHook) {
        this.listenerManager = new ListenerManager(this.renderer)
        this.baseTranslatePosition = this.slidesInfo.spaceBetween()
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    /**
     * Inicializa la instancia de Swiper
     * @param swiperContainer Referencia al elemento contenedor
    */
    initSwiper(swiperContainer: ElementRef<SwiperContainer>): void {
        SwiperValidators.validateContainer(swiperContainer)
        this.swiperContainer = swiperContainer
        const swiperOptions = this.createSwiperOptions()

        Object.assign(this.swiperContainer.nativeElement, swiperOptions)
        this.swiperContainer.nativeElement.initialize()

        this.swiper = this.swiperContainer.nativeElement.swiper
        this.setupEventListeners()
        this.setupReactiveUpdates()
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
        runInInjectionContext(this.injector, () => {
            this.slidesInfo.onSlidesChange(() => {
                this.changeSlidesPerGroup(this.slidesInfo.slidesPerView())
            });
        })
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
    }

    private updateContainerPadding(isEnd: boolean): void {
        if (isEnd) {
            this.deletePaddingToSwiperContainer();
            this.triggerDataLoadIfNeeded()
        } else {
            this.setPaddingToSwiperContainer();
        }
    }

    private triggerDataLoadIfNeeded(): void {
        if (!this.infiniteDataConfig) return;

        const { data, requestMoreData } = this.infiniteDataConfig;

        if (this._isFetchingMoreData()) return;

        const list = untracked(() => data());
        if (!hasNextPage(list)) return;

        this._isFetchingMoreData.set(true);
        this._atCarouselEnd.set(false);
        requestMoreData.emit();
        this.scheduleUpdateSwiper();
    }

    // ==========================================
    // LAYOUT & PADDING
    // ==========================================

    private setPaddingToSwiperContainer(): void {
        console.log(this.slidesInfo.paddingX(),this.slidesInfo.spaceBetween(),this.slidesInfo.slidesPerView())
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
            (slide.offsetLeft + this.expandedSlideWidth()) > viewportWidth;
    }

    private applyTranslateAdjustment(slide: HTMLElement): void {
        const viewportWidth = this.swiperContainer.nativeElement.offsetWidth;

        this.adjustOffsetForEndSlides()

        const newTranslate = this.calculateAdjustedTranslate(slide, viewportWidth);
        this.swiper.translateTo(newTranslate, SwiperHelper.CONFIG.ANIMATION_DURATION);
        this.shouldResetTranslate = true;
    }

    private adjustOffsetForEndSlides(): void {
        if (this.swiper.isEnd) {
            this.swiperContainer.nativeElement.slidesOffsetAfter =
                this.expandedSlideWidth() + this.slidesInfo.spaceBetween();
        }
    }

    private calculateAdjustedTranslate(slide: HTMLElement, viewportWidth: number): number {
        return viewportWidth -
            (slide.offsetLeft + this.expandedSlideWidth() + this.slidesInfo.spaceBetween());
    }

    restoreBaseTranslate(): void {
        if (!this.shouldResetTranslate) return

        this.ensureSwiperReady()
        this.swiperContainer.nativeElement.slidesOffsetAfter = this.slidesInfo.spaceBetween()
        this.swiper.translateTo(this.baseTranslatePosition, SwiperHelper.CONFIG.ANIMATION_DURATION);
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
     * @param requestMoreData Emitter para solicitar más datos
     */
    setupInfiniteDataLoading<T extends MovieList | SerieList>(
        data: InputSignal<T | undefined>,
        requestMoreData: OutputEmitterRef<void>
    ): void {
        this.infiniteDataConfig = {
            data: data as InputSignal<MovieList | SerieList | undefined>,
            requestMoreData
        };
        runInInjectionContext(this.injector, () => {
            this.setupDataLoadedEffect(data as InputSignal<MovieList | SerieList | undefined>);
        });
    }

    private setupDataLoadedEffect(data: InputSignal<MovieList | SerieList | undefined>): void {
        const dataLoadedEffect = effect(() => {
            if (data()) {
                this._isFetchingMoreData.set(false);
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

    setHoverState(isHovered: boolean): void { this._isHoveredOverCarousel = isHovered }

    destroy(): void {
        this.cancelUpdateSwiper()
        this.listenerManager.cleanupAll()
    }
}
