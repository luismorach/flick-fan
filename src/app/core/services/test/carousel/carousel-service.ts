import { computed, DestroyRef, ElementRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animationFrameScheduler, audit, auditTime, fromEvent } from 'rxjs';
import { LoaderCore } from '../../../../shared/utils/data-loaders/types';
import { CarouselOptions } from '../../../interfaces/shared/carousel-interface';
import { CarouselController, useCarouselcontroller } from '../util/use-carousel-controller';
import { DeviceService } from '../../device/device-service.service';
import { SlidesInfoHook, useSlidesInfo } from '../util/use-slides-info';

@Injectable()
export class CarouselService<T extends Object, R extends keyof T> {
    // ==========================================
    // DEPENDENCIES
    // ==========================================
    private readonly destroyRef = inject(DestroyRef);
    private readonly device = inject(DeviceService)

    private slidesInfo: SlidesInfoHook = useSlidesInfo(undefined, {})
    private controller?: CarouselController

    // ==========================================
    // STATE
    // ==========================================
    private readonly scrollPosition = signal(0)
    private readonly finalScrollPosition = signal(0)
    private readonly isHoveredOverCarousel = signal(false);
    private readonly isHoveredOverPreview = signal(false);
    private readonly showControls = computed(() => this.isHoveredOverCarousel() || this.isHoveredOverPreview());
    readonly scrollProgress = signal(0)

    // ==========================================
    // PUBLIC STATE (READONLY SIGNALS)
    // ==========================================
    readonly navigation = {
        next: () => this.controller?.next(),
        prev: () => this.controller?.prev(),
        translateToCurrentPosition: () => this.controller?.scrollToCurrentPosition(),
        snapBackIfOverScroller: () => this.controller?.snapBackIfOverscrolled(),
        resetPosition: () => this.controller?.resetPosition()
    }

    readonly state = computed(() => {
        return {
            activeIndex: this.controller?.activeIndex,
            isAtStart: this.controller?.isAtStart,
            isAtEnd: this.controller?.isAtEnd,
            isAtSkeleton: this.controller?.isAtSkeleton,
            showControls: this.showControls,
            currentElement: this.controller?.currentElement,
            currentPosition: this.controller?.currentPosition,
            finalScrollPosition: this.finalScrollPosition.asReadonly(),
            scrollPosition: this.scrollPosition.asReadonly(),
            slidesInfo: this.slidesInfo,
            scrollProgress: this.scrollProgress,
            onPreviewMouseEnter: this.onPreviewMouseEnter.bind(this),
            onPreviewMouseLeave: this.onPreviewMouseLeave.bind(this)
        }
    })

    initialize(carouselContainer: ElementRef<HTMLElement>, carouselOptions: CarouselOptions,
        loader?: LoaderCore<T, R>
    ): void {
        this.controller = useCarouselcontroller(carouselContainer, carouselOptions, loader)
        this.slidesInfo = this.controller?.slidesInfo
        this.setupEventListeners(carouselContainer)

    }

    private setupEventListeners(carouselContainer: ElementRef<HTMLElement>): void {
        const carouselViewport = carouselContainer.nativeElement.parentElement;
        if (!carouselViewport) return;

        this.setupHoverListeners(carouselViewport)
        this.setupScrollListener(carouselContainer.nativeElement)
    }

    private setupHoverListeners(viewport: HTMLElement): void {
        fromEvent(viewport, 'mouseenter').pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.isHoveredOverCarousel.set(true));

        fromEvent(viewport, 'mouseleave').pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.isHoveredOverCarousel.set(false));
    }

    private onPreviewMouseEnter() {
        this.isHoveredOverPreview.set(true);
    }

    private onPreviewMouseLeave() {
        this.isHoveredOverPreview.set(false);
    }

    private setupScrollListener(carouselContainer: HTMLElement): void {
        fromEvent(carouselContainer, 'scroll').pipe(
            auditTime(0, animationFrameScheduler),
            takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                const scroll = this.controller?.slidesInfo.direction() === 'vertical'
                    ? carouselContainer.scrollTop : carouselContainer.scrollLeft;

                const slideSize = this.slidesInfo.layout().slideMainAxisSizeWithGap;
                if (!slideSize) return;

                this.scrollProgress.set(scroll / slideSize);

                //this.scrollPosition.set(scroll)
            });

        fromEvent(carouselContainer, 'scrollend').pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.handleScroll(carouselContainer));
    }

    private handleScroll(carouselContainer: HTMLElement): void {
        const scroll = this.controller?.slidesInfo.direction() === 'vertical'
            ? carouselContainer.scrollTop : carouselContainer.scrollLeft;
        //console.log('posicion antes de adjustscroll', scroll)

        this.finalScrollPosition.set(scroll)
        this.controller?.adjustScrollToNearestIndex(this.device.device());

    }
}