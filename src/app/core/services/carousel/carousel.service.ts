import { computed, DestroyRef, effect, ElementRef, inject, Injectable, InputSignal, signal, Signal, untracked } from '@angular/core';
import { SkeletonSlidesHook } from '../../../shared/utils/use-skeleton-slides';
import { PaginatedData } from '../../interfaces/shared/generic.interface';
import { DataLoaderManager } from '../../../shared/utils/data-loader-manager';
import { Movie } from '../../interfaces/movie/movie.interface';
import { Serie } from '../../interfaces/serie/serie.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, fromEvent } from 'rxjs';
import { WindowService } from '../window/window.service';

@Injectable()
export class CarouselService<T extends Movie | Serie> {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  readonly dataLoaderManager: DataLoaderManager<T> = inject(DataLoaderManager<T>)
  private readonly destroyRef = inject(DestroyRef);
  private readonly windowService = inject(WindowService)

  // ==========================================
  // CONFIGURATION
  // ==========================================
  private carouselContainer?: HTMLElement;
  private isIntersectionObserverRequired = false;
  private slidesInfo?: SkeletonSlidesHook
  private readonly SCROLL_DEBOUNCE_MS = 150;

  // ==========================================
  // STATE
  // ==========================================
  private readonly _activeIndex = signal(0);
  private readonly _isHoveredOverCarousel = signal(false);
  private isInitialized = false
  private containerWidth = signal(0)

  // ==========================================
  // PUBLIC STATE (READONLY SIGNALS)
  // ==========================================
  readonly activeIndex = this._activeIndex.asReadonly()
  readonly isHoveredOverCarousel = this._isHoveredOverCarousel.asReadonly()

  // ==========================================
  // COMPUTED VALUES
  // ==========================================
  readonly currentElement = computed(() => {
    const data = this.dataLoaderManager.data();
    const index = this._activeIndex();
    return data[index] ?? null;
  });

  readonly currentPosition = computed(() => {
    const fullWidth = this.slideFullWidth();
    const index = this.activeIndex();

    if (!this.slidesInfo) {
      return index * fullWidth;
    }

    const position = (fullWidth * index) - this.slidesInfo.peek();
    return Math.max(0, position);
  })

  private readonly navigableSkeletonsCount = computed(() => {
    if (!this.dataLoaderManager.canLoadMore()) return 0;
    return this.slidesInfo?.navigableSkeletonsCount() ?? 1
  });

  readonly totalVisibleItems = computed(() => {
    const data = this.dataLoaderManager.data().length;
    return data + this.navigableSkeletonsCount();
  });

  readonly isAtStart = computed(() => this._activeIndex() === 0)
  readonly isAtEnd = computed(() => this.activeIndex() + this.slidesPerView() >= this.totalVisibleItems())
  readonly slidesPerView = computed(() => this.slidesInfo?.slidesPerView() ?? 1);
  readonly slideFullWidth = computed(() => this.slidesInfo?.slidefullWidth() ?? this.containerWidth())

  initialize(
    carouselContainer: Signal<ElementRef<HTMLElement> | undefined>,
    data: InputSignal<PaginatedData<T> | undefined>,
    config: {
      slidesInfo?: SkeletonSlidesHook;
      requiresIntersectionObserver?: boolean;
    } = {}
  ): void {
    this.slidesInfo = config.slidesInfo;
    this.isIntersectionObserverRequired = config.requiresIntersectionObserver ?? false;
    this.dataLoaderManager.setupDataSource(data);
    this.setupDataLoadedEffect();
    this.setupCarouselContainerEffect(carouselContainer);
  }

  private setupDataLoadedEffect(): void {
    effect(() => {
      if (this.dataLoaderManager.changeLength() && this.validateInitialization()) {
        untracked(() => {
          this.snapBackIfOverscrolled()
        })
      }
    });
  }

  private snapBackIfOverscrolled(): void {
    if (this.dataLoaderManager.canLoadMore()) return

    const maxAllowedIndex = Math.max(0, this.totalVisibleItems() - this.slidesPerView());
    const currentIndex = this.activeIndex();

    if (currentIndex <= maxAllowedIndex) return;

    this._activeIndex.set(maxAllowedIndex);
    this.scrollToCurrentPosition()
  }

  private setupCarouselContainerEffect(
    carouselContainer: Signal<ElementRef<HTMLElement> | undefined>): void {
    effect(() => {
      const container = carouselContainer()
      if (!container) return
      untracked(() => {
        this.initCarousel(container);
      })
    });
  }

  private initCarousel(carouselContainer: ElementRef<HTMLElement>): void {
    try {
      this.carouselContainer = carouselContainer.nativeElement
      this.isInitialized = true
      this.setupEventListeners()
      this.setupContainerResize()
      this.scrollToCurrentPosition('instant')
      if (this.isIntersectionObserverRequired)
        this.dataLoaderManager.setupIntersectionObserver(this.carouselContainer)
    } catch (error) {
      this.isInitialized = false;
    }
  }

  private setupEventListeners(): void {
    const carouselViewport = this.carouselContainer?.parentElement;
    if (!carouselViewport) return;

    this.setupHoverListeners(carouselViewport)
    this.setupScrollListener()
  }

  private setupContainerResize() {
    if (!this.carouselContainer) return

    const resizeObserver = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect?.width;
      if (width === undefined) return;
      this.containerWidth.set(width)
      this.scrollToCurrentPosition('instant')
    });

    resizeObserver.observe(this.carouselContainer);

    this.destroyRef.onDestroy(() => {
      resizeObserver?.disconnect();
    });
  }

  private setupHoverListeners(viewport: HTMLElement): void {
    fromEvent(viewport, 'mouseenter').pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this._isHoveredOverCarousel.set(true));

    fromEvent(viewport, 'mouseleave').pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this._isHoveredOverCarousel.set(false));
  }

  private setupScrollListener(): void {
    if (!this.carouselContainer) return;

    fromEvent(this.carouselContainer, 'scroll').pipe(
      debounceTime(this.SCROLL_DEBOUNCE_MS),
      takeUntilDestroyed(this.destroyRef)
    )
      .subscribe(() => this.handleScroll());
  }

  private handleScroll(): void {
    if (!this.windowService.isDesktop()) {
      this.adjustScrollToNearestIndex()
    }

    if (this.isAtEnd() && this.dataLoaderManager.canLoadMore()) {
      this.dataLoaderManager.loadMoreData();
    }
  }

  /**
 * Adjusts scroll position to snap to the nearest slide index.
 * Only called on non-desktop devices for touch/swipe interactions.
 */
  private adjustScrollToNearestIndex() {
    if (!this.carouselContainer || this.slideFullWidth() === 0) return;

    const scrollLeft = this.carouselContainer.scrollLeft;
    const fullWidth = this.slideFullWidth();
    const nearestIndex = Math.round(scrollLeft / fullWidth);
    const maxIndex = Math.max(0, this.totalVisibleItems() - this.slidesPerView());
    const validIndex = Math.max(0, Math.min(nearestIndex, maxIndex));
    this._activeIndex.set(validIndex);
    this.scrollToCurrentPosition();
  }

  next(): void {
    if (this.isAtEnd() || !this.validateInitialization()) return;

    const maxIndex = this.totalVisibleItems() - this.slidesPerView();
    const nextIndex = Math.min(this.activeIndex() + this.slidesPerView(), maxIndex);
    this._activeIndex.set(nextIndex);
    this.scrollToCurrentPosition();
  }

  prev(): void {
    if (this.isAtStart() || !this.validateInitialization()) return;

    const prevIndex = Math.max(0, this.activeIndex() - this.slidesPerView());
    this._activeIndex.set(prevIndex);
    this.scrollToCurrentPosition();
  }

  private scrollToCurrentPosition(behavior: ScrollBehavior = 'smooth'): void {
    if (!this.carouselContainer) return;
    this.carouselContainer.scrollTo({ left: this.currentPosition(), behavior });
  }

  private validateInitialization(): boolean {
    return this.isInitialized && this.carouselContainer !== undefined;
  }
}
