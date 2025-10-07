import {
    computed, effect, ElementRef, inject, Injector, InputSignal, OutputEmitterRef, Renderer2,
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
import { DataLoaderConfig, LayoutDimensions } from "./types.ts/swiper.types"

export class SwiperHelper {

    readonly atCarouselEnd = signal(false)
    readonly atCarouselStart = signal(true)
    readonly isFetchingMoreData = signal(false)
    isHoveredOverCarousel = false
    private injector: Injector = inject(Injector)
    private renderer: Renderer2 = inject(Renderer2)
    private slidesInfo: SkeletonSlidesHook
    private swiperContainer!: ElementRef<SwiperContainer>
    private swiper!: Swiper
    private baseTranslatePosition = 0
    private shouldResetTranslate = false
    private raf: number | null = null;
    private expandedSlideWidth = computed(() =>
        Math.floor(this.slidesInfo.getCurrentSlideWidth() * SwiperHelper.CONFIG.EXPANDED_SLIDE_MULTIPLIER))
    private listenerManager: ListenerManager

    private static readonly CONFIG = {
        /**
        * Multiplicador para el ancho de slides expandidas
        * 2.8x = slide base + expansión visual + espaciado
        */
        EXPANDED_SLIDE_MULTIPLIER: 2.8,
        ANIMATION_DURATION: 300,
    } as const;

    private cachedDimensions ?: LayoutDimensions
    private infiniteDataConfig?: DataLoaderConfig

    constructor(slidesInfo: SkeletonSlidesHook) {
        this.slidesInfo = slidesInfo
        this.listenerManager = new ListenerManager(this.renderer)
        this.baseTranslatePosition = this.slidesInfo.spaceBetween()
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    initSwiper(swiperContainer: ElementRef<SwiperContainer>) {
        SwiperValidators.validateContainer(swiperContainer)
        this.swiperContainer = swiperContainer
        const swiperOptions = this.createSwiperOptions()

        Object.assign(this.swiperContainer.nativeElement, swiperOptions)
        this.swiperContainer.nativeElement.initialize()

        this.swiper = this.swiperContainer.nativeElement.swiper
        this.setupEventListeners()
        this.setupReactiveUpdates()
    }

    private createSwiperOptions() {
        const swiperOptions: SwiperOptions = {
            modules: [Mousewheel, FreeMode],
            slidesPerView: 'auto',
            allowTouchMove: false,
            slidesPerGroup: this.slidesInfo.getCurrentSlidesPerView(),
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
   
    private setupReactiveUpdates() {
        runInInjectionContext(this.injector, () => {
            const slidesEffect = this.slidesInfo.onSlidesChange(() => {
                this.changeSlidesPerGroup(this.slidesInfo.getCurrentSlidesPerView())
            });
            this.listenerManager.addEffectRef(slidesEffect)
        })
    }

    private changeSlidesPerGroup(slidesPerGroup: number) {
        this.ensureSwiperReady()
        this.swiperContainer.nativeElement.slidesPerGroup = slidesPerGroup
        this.invalidateCache()
        this.scheduleUpdateSwiper()
    }

    private invalidateCache(): void {
        this.cachedDimensions = undefined
    }

    setImportance(importance:InputSignal<number>){
        this.renderer.setAttribute(this.swiperContainer.nativeElement, 'style', `z-index:${importance()};`);
    }

    // ==========================================
    // EVENT HANDLING
    // ==========================================

    private setupEventListeners() {
        this.ensureSwiperReady()
        this.listenerManager.listen(this.swiperContainer.nativeElement,
            'swiperslidechange', (event: CustomEvent<[Swiper]>) => {
                const [detail] = event.detail;
                this.handleSlideChange(detail)
            })

        this.listenerManager.listen(this.swiperContainer.nativeElement,
            'swiperslidechangetransitionend', (event: CustomEvent<[Swiper]>) => {
                this.baseTranslatePosition = event.detail[0].translate;
                this.swiper.enable()
            })

        this.listenerManager.listen(this.swiperContainer.nativeElement,
            'swiperslidechangetransitionstart', () => {
                this.swiper.disable()
            })
    }

    private handleSlideChange(detail: Swiper) {
        this.atCarouselStart.set(detail.isBeginning)
        this.atCarouselEnd.set(detail.isEnd);
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

        if (this.isFetchingMoreData()) return;

        const list = untracked(() => data());
        if (!hasNextPage(list)) return;

        this.isFetchingMoreData.set(true);
        this.atCarouselEnd.set(false);
        requestMoreData.emit();
        this.scheduleUpdateSwiper();
    }

    // ==========================================
    // LAYOUT & PADDING
    // ==========================================

    private getLayoutDimensions() {
        this.ensureSwiperReady()
        const containerWidth = this.swiper.width;
        const slideWidth = this.slidesInfo.getCurrentSlideWidth() + this.slidesInfo.spaceBetween();

        if (this.cachedDimensions?.containerWidth === containerWidth &&
            this.cachedDimensions?.slideWidth === slideWidth) {
            return this.cachedDimensions;
        }

        const numSlides = this.slidesInfo.getCurrentSlidesPerView()
        const usedWidth = (numSlides * slideWidth) + this.slidesInfo.spaceBetween()
        const remainingSpace = containerWidth - usedWidth;
        const padding = Math.floor(Math.max(remainingSpace / 2, 0));

        this.cachedDimensions = { containerWidth, slideWidth, padding };
        return this.cachedDimensions;
    }

    private setPaddingToSwiperContainer() {
        const paddingX = this.getLayoutDimensions().padding
        this.renderer.setStyle(
            this.swiper.wrapperEl,
            'padding',
            `0px ${paddingX}px`
        )
    }

    private deletePaddingToSwiperContainer() {
        this.renderer.setStyle(
            this.swiper.wrapperEl,
            'padding',
            '0px'
        )
    }

    // ==========================================
    // TRANSLATE ADJUSTMENTS
    // ==========================================

    adjustTranslateForExpandedSlide(index: number) {
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

    restoreBaseTranslate() {
        if (!this.shouldResetTranslate) return

        this.ensureSwiperReady()
        this.swiperContainer.nativeElement.slidesOffsetAfter = this.slidesInfo.spaceBetween()
        this.swiper.translateTo(this.baseTranslatePosition, SwiperHelper.CONFIG.ANIMATION_DURATION);
        this.shouldResetTranslate = false
    }

    // ==========================================
    // NAVIGATION
    // ==========================================

    goToNextSlide() {
        this.swiper.slideNext();
    }

    goToPrevSlide() {
        this.swiper.slidePrev();
    }

    // ==========================================
    // INFINITE DATA
    // ==========================================

    setupInfiniteDataLoading<T extends MovieList | SerieList>(
        data: InputSignal<T | undefined>,
        requestMoreData: OutputEmitterRef<void>
    ) {
        this.infiniteDataConfig = {
            data: data as InputSignal<MovieList | SerieList | undefined>,
            requestMoreData
        };
        runInInjectionContext(this.injector, () => {
            this.setupDataLoadedEffect(data as InputSignal<MovieList | SerieList | undefined>);
        });
    }

    private setupDataLoadedEffect(data: InputSignal<MovieList | SerieList | undefined>) {
        const dataLoadedEffect = effect(() => {
            if (data()) {
                this.isFetchingMoreData.set(false);
                this.atCarouselEnd.set(false);
                this.scheduleUpdateSwiper()
            }
        });
        this.listenerManager.addEffectRef(dataLoadedEffect)
    }

    // ==========================================
    // UTILS
    // ==========================================

    async updateSwiperAfterHoverTransition() {
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

    private scheduleUpdateSwiper(enableBefore = false) {
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

    private cancelUpdateSwiper() {
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

    destroy() {
        this.cancelUpdateSwiper()
        this.listenerManager.cleanupAll()
        this.listenerManager.destroyEffectRef()
    }
}
