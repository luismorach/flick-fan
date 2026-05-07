import { computed, DestroyRef, effect, ElementRef, inject, Injectable, signal, Signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { CarouselOptions } from '../../interfaces/shared/carousel-interface';
import { SlidesInfoHook, useSlidesInfo } from '../../../shared/utils/use-slides-info';
import { useIntersectionObserver } from '../../../shared/utils/use-intersection-observer';
import { CarouselController, CarouselNavigationAPI, CarouselStateAPI, useCarouselcontroller } from '../../../shared/utils/use-carousel-controller';
import { AnyEnhancedLoader } from '../../../shared/utils/data-loaders/types';
import { hasPagination } from '../../../shared/utils/data-loaders/enhancers/with-pagination';
import { canLoadDetails } from '../../../shared/utils/data-loaders/enhancers/with-details';

@Injectable()
export class CarouselService<T extends Object, R extends keyof T> {
    // ==========================================
    // DEPENDENCIES
    // ==========================================
    private readonly destroyRef = inject(DestroyRef);
    slidesInfo: SlidesInfoHook = useSlidesInfo(signal(undefined), {})
    private loader?: AnyEnhancedLoader<T, R>
    private controller: CarouselController = useCarouselcontroller(signal(undefined), { slidesConfig: {} }, this.loader)

    // ==========================================
    // STATE
    // ==========================================
    private readonly _isHoveredOverCarousel = signal(false);
    readonly isHoveredOverCarousel = this._isHoveredOverCarousel.asReadonly()

    // ==========================================
    // PUBLIC STATE (READONLY SIGNALS)
    // ==========================================
    readonly navigation: CarouselNavigationAPI = {
        next: () => this.controller.next(),
        prev: () => this.controller.prev(),
        resetPosition: () => this.controller.resetPosition()
    }

    readonly state: Signal<CarouselStateAPI> = computed(() => {
        return {
            activeIndex: this.controller.activeIndex,
            isAtStart: this.controller.isAtStart,
            isAtEnd: this.controller.isAtEnd,
            isAtSkeleton: this.controller.isAtSkeleton,
            currentElement: this.controller.currentElement,
            currentPosition: this.controller.currentPosition
        }
    })


    initialize(
        carouselContainer: Signal<ElementRef<HTMLElement> | undefined>,
        carouselOptions: CarouselOptions,
        loader?: AnyEnhancedLoader<T, R>
    ): void {
        this.loader = loader
        this.controller = useCarouselcontroller(carouselContainer, carouselOptions, loader)
        this.slidesInfo = this.controller.slidesInfo
        this.setupDataLoadedEffect();
        this.setupCarouselContainerEffect(carouselContainer, carouselOptions);
    }

    private setupDataLoadedEffect(): void {
        effect(() => {
            if (this.loader?.dataLength() && this.loader?.isInitialized()) {
                untracked(() => {
                    /*  requestAnimationFrame(() => {
                         this.scrollToCurrentPosition()
                     }) */
                    this.controller.snapBackIfOverscrolled()
                })
            }
        });
    }

    private setupCarouselContainerEffect(
        carouselContainer: Signal<ElementRef<HTMLElement> | undefined>, carouselOptions: CarouselOptions): void {
        effect(() => {
            const container = carouselContainer()
            if (!container) return
            untracked(() => {
                this.initCarousel(container, carouselOptions);
            })
        });
    }

    private initCarousel(carouselContainer: ElementRef<HTMLElement>, carouselOptions: CarouselOptions,): void {
        try {
            this.setupEventListeners(carouselContainer)

            if (carouselOptions.requiresEnrichment && canLoadDetails(this.loader)) {
                const cleanup = useIntersectionObserver(carouselContainer,
                    this.loader.loadDetails.bind(this.loader))
                this.destroyRef.onDestroy(cleanup)
            }
        } catch (error) {
            console.log('error inizializando', error)
        }
    }

    private setupEventListeners(carouselContainer: ElementRef<HTMLElement>): void {
        const carouselViewport = carouselContainer.nativeElement.parentElement;
        if (!carouselViewport) return;

        this.setupHoverListeners(carouselViewport)
        this.setupScrollListener(carouselContainer.nativeElement)
    }

    private setupHoverListeners(viewport: HTMLElement): void {
        fromEvent(viewport, 'mouseenter').pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this._isHoveredOverCarousel.set(true));

        fromEvent(viewport, 'mouseleave').pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this._isHoveredOverCarousel.set(false));
    }

    private setupScrollListener(carouselContainer: HTMLElement): void {
        fromEvent(carouselContainer, 'scrollend').pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.handleScroll(carouselContainer));
    }

    private handleScroll(carouselContainer: HTMLElement): void {
        console.log('posicion antes de adjustscroll',carouselContainer.scrollLeft) 
        this.controller?.adjustScrollToNearestIndex()

    }
}