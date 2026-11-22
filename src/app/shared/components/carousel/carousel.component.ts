import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, contentChild, effect, ElementRef, inject, input, output, TemplateRef, untracked, viewChild, viewChildren } from '@angular/core';
import { CarouselService } from '../../../core/services/carousel/carousel-service';
import { AnyLoader } from '../../utils/data-loaders/types';
import { CarouselOptions } from '../../../core/interfaces/shared/carousel-interface';
import { fade } from '../../animations/animations';
import { canLoadDetails } from '../../utils/data-loaders/enhancers/with-details';
import { useIntersectionObserver } from '../../utils/use-intersection-observer';
import { InViewDirective } from '../../../core/directives/in-view/in-view.directive';
import { CarouselNavigationComponent } from './carousel-navigation/carousel-navigation.component';

@Component({
  selector: 'app-carousel',
  imports: [NgTemplateOutlet, CarouselNavigationComponent, InViewDirective],
  providers: [CarouselService],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
  animations: [fade]
})
export class CarouselComponent {

  //inputs
  readonly loader = input.required<AnyLoader>();
  readonly carouselOptions = input.required<CarouselOptions>();

  //outputs
  activeMedia = output<any>()

  //dependencies
  readonly carouselService = inject(CarouselService<any, any>);
  private intersection = useIntersectionObserver()

  //content queries
  readonly headerTemplateRef = contentChild<TemplateRef<any>>('headerTemplate');
  readonly cardTemplateRef = contentChild<TemplateRef<any>>('cardTemplate');
  readonly skeletonTemplateRef = contentChild<TemplateRef<any>>('skeletonTemplate');

  //view queries
  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carousel')
  private readonly slides = viewChildren<ElementRef<HTMLElement>>('slides')
  view = viewChild(InViewDirective)

  readonly isVertical = computed(() => this.carouselService.state().slidesInfo.direction() === 'vertical')

  readonly viewportHeight = computed(() => {
    if (this.carouselService.state().slidesInfo.direction() === 'vertical') {
      const height = (this.carouselService.state().slidesInfo.layout().slideMainAxisSize) *
        this.carouselService.state().slidesInfo.layout().slidesPerView
      return `${height}px`
    }
    return '100%'
  })

  readonly viewportWidth = computed(() => {
    if (this.carouselService.state().slidesInfo.direction() === 'horizontal') {
      const width = (this.carouselService.state().slidesInfo.layout().slideMainAxisSize) *
        this.carouselService.state().slidesInfo.layout().slidesPerView
      return `${width}px`
    }
    return '100%'
  })

  readonly padding = computed(() => {
    const slidesInfo = this.carouselService.state().slidesInfo;
    const layout = slidesInfo.layout();

    const before = layout.centeredSlides
      ? layout.spacingToCenterSlide
      : layout.peekSize + layout.slidesOffsetBefore;

    const after = layout.centeredSlides
      ? layout.spacingToCenterSlide
      : layout.peekSize + layout.slidesOffsetAfter;

    const [top, right, bottom, left] =
      slidesInfo.direction() === 'horizontal'
        ? [0, after, 0, before]
        : [before, 0, after, 0];

    return `${top}px ${right}px ${bottom}px ${left}px`;
  })

  initialize = effect(() => {
    const loader = this.loader()
    const container = this.carouselContainer()
    const options = this.carouselOptions()
    if (!loader || !container || !options) return

    untracked(() => {
      this.carouselService.initialize(container, options, loader)
      if (canLoadDetails(loader)) {
        this.intersection.initialize(container, loader.loadDetails.bind(loader))
      }
    })
  })

  translate = effect(() => {
    const position = this.carouselService.state().currentPosition?.()
    if (position === undefined) return
    console.log('effect translate', position, 'userSettling', this.carouselService.state().isScrollSnapping())
    untracked(() => {
      if (this.carouselService.state().isScrollSnapping()) return
      console.log('trasladando')
      this.carouselService.navigation.translateToCurrentPosition()
    })
  })

  addElements = effect(() => {
    const elements = this.slides()
    const loader = this.loader()
    untracked(() => {
      if (!elements || !loader || !canLoadDetails(loader)) return
      console.log('effect elements', elements)
      const elementsHtml = elements.map(ref => ref.nativeElement);
      this.intersection.observeElements(elementsHtml);
    })
  })

  animating = effect(() => {
    const progress = this.carouselService.state().scrollProgress()
    const slides = this.slides()
    untracked(() => {
      if (!this.carouselOptions().requireAnimation || slides.length === 0) return
      this.updateSlidesStyles(progress, slides)
    })

  })

  changeActiveElement = effect(() => {
    this.activeMedia.emit(this.carouselService.state().currentElement?.())
  })

  constructor() {
    console.log('carousel instanciado');
  }

  private updateSlidesStyles(progress: number, slides: readonly ElementRef<HTMLElement>[]) {
    const slidesPerView = this.carouselService.state().slidesInfo.layout().slidesPerView
    const visibleRange = Math.floor(slidesPerView / 2);

    slides.forEach((slide, i) => {
      const slideEl = slide.nativeElement
      const signedProgress = Number((i - progress).toFixed(2));
      const slideProgress = Math.abs(signedProgress);
      const scale = Math.max(1, 2 - slideProgress * 0.5);
      const zIndex = Math.max(0, 20 - Math.round(slideProgress * 5));
      let opacity = 100

      let translate = Math.max(0, slideProgress - 1) * 30;

      let signedTranslate = -Math.sign(signedProgress) * translate;

      if (slideProgress > visibleRange) {
        const animationProgress = Math.min(1, Math.max(0, slideProgress - 2));
        opacity = 1 - animationProgress;
        translate = 30 + animationProgress * 110;
        signedTranslate = -Math.sign(signedProgress) * translate;
      }

      slideEl.style.opacity = `${opacity}`
      slideEl.style.transform = this.isVertical()
        ? `scale(${scale}) translateY(${signedTranslate}%)`
        : `scale(${scale}) translateX(${signedTranslate}%)`
      slideEl.style.zIndex = String(zIndex);
    })

  }

}
