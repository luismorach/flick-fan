import { CdkPortalOutlet } from '@angular/cdk/portal';
import {
  ChangeDetectorRef,
  computed, contentChild, Directive, ElementRef, HostListener, inject,
  input, output, Renderer2
} from '@angular/core';
import { TimerManager } from '../../../shared/utils/timer-manager';
import { FloatTrailerService } from '../../services/float-trailer/float-trailer.service';
import { ApiService } from '../../services/API/api.service';
import { Serie } from '../../interfaces/serie/serie.interface';
import { getKeyTrailer } from '../../../shared/utils/helpers';
import { useSlideExpansion } from '../../../shared/utils/use-slide-expansion';
import { CarouselService } from '../../services/carousel/carousel-service';

@Directive({
  selector: '[appHoverSerieExpand]',
  standalone: true,
  providers: [TimerManager],
})
export class HoverSerieExpandDirective {

  private readonly floatTrailer = inject(FloatTrailerService);
  private readonly renderer: Renderer2 = inject(Renderer2)
  private readonly timerManager: TimerManager = inject(TimerManager)
  private readonly api = inject(ApiService)
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly cardElement: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;

  readonly serie = input.required<Serie>()
  readonly cardIndex = input<number>()
  readonly carouselService = input.required<CarouselService<any, any>>()

  readonly expanded = output<HTMLElement>();
  readonly collapse = output<HTMLElement>();

  private readonly poster = contentChild.required<ElementRef<HTMLElement>>('posterImage')
  private readonly backdrop = contentChild.required<ElementRef<HTMLElement>>('backdropImage')
  private readonly portalHost = contentChild.required<CdkPortalOutlet>(CdkPortalOutlet)

  private readonly posterElement = computed(() => this.poster().nativeElement);
  private readonly backdropElement = computed(() => this.backdrop().nativeElement);
  private readonly parentElement = computed(() => this.cardElement.parentElement);

  private readonly activeIndex = computed(() => this.carouselService().state().activeIndex?.() ?? 0)
  private readonly slideInfo = computed(() => this.carouselService().state().slidesInfo)

  private readonly width = computed(() => this.slideInfo().layout().slideMainAxisSize)
  private readonly expandedWidth = computed(() => this.slideInfo().layout().expandedSlideSize)

  private readonly slideExpansion = useSlideExpansion()

  @HostListener('mouseenter') onMouseEnter() {

    const activeIndex = this.activeIndex() ?? 0
    const cardIndex = this.cardIndex() ?? 0
    const canExpand = this.slideExpansion.canExpand(activeIndex, cardIndex,
      this.slideInfo().layout().slidesPerView)

    if (!canExpand) return
    const slideElement = this.parentElement()
    this.getDetailsSerie()
    this.timerManager.addTimeout(() => {
      this.changeWidthSlide(this.expandedWidth(), '0s')
      this.animateImageChange(0, '0s');
      if (slideElement) this.expanded.emit(slideElement)
      this.attachTrailer()
    }, 300)

  }

  private getDetailsSerie() {
    this.api.getDetailsSerie({ dataId: this.serie().id }).subscribe((detailsSerie) => {
      this.serie().videos = detailsSerie.videos
      this.serie().images = detailsSerie.images
      setTimeout(() => this.cdr.markForCheck(), 350)
    })
  }

  private changeWidthSlide(width: number, delay: string) {
    console.log('creciendo',this.cardElement,width,delay)
    this.renderer.setStyle(this.cardElement, 'will-change', 'width')
    this.renderer.setStyle(this.cardElement, 'transition', `width .3s cubic-bezier(.2,.45,0,1) ${delay}`) 
    this.renderer.setStyle(this.cardElement, 'width', `${width}px`)
  }

  private animateImageChange(posterOpacity: number, delay: string) {
    const backdropOpacity = 1 - posterOpacity;
    this.renderer.setStyle(this.posterElement(), 'transition', `opacity .3s cubic-bezier(.2,.45,0,1) ${delay}`)
    this.renderer.setStyle(this.posterElement(), 'opacity', `${posterOpacity}`);
    this.renderer.setStyle(this.backdropElement(), 'transition', `opacity .3s cubic-bezier(.2,.45,0,1) ${delay}`)
    this.renderer.setStyle(this.backdropElement(), 'opacity', `${backdropOpacity}`); 
  }

  attachTrailer() {
    const key = getKeyTrailer(this.serie().videos)
    this.floatTrailer.playTrailerEmbed(key, this.portalHost());
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.timerManager.clearAllTimeouts()
    this.resetSlide()
  }

  private resetSlide() {
    const slideElement = this.parentElement()
    this.floatTrailer.detachTrailerEmbed()
    this.changeWidthSlide(this.width(), '300ms')
    this.animateImageChange(1, '300ms')
    if (slideElement) this.collapse.emit(slideElement) 
  }
}
