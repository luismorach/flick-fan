import { CdkPortalOutlet } from '@angular/cdk/portal';
import {
  ChangeDetectorRef,
  computed, contentChild, Directive, ElementRef, HostListener, inject,
  input, output, Renderer2
} from '@angular/core';
import { TimerManager } from '../../../shared/utils/timer-manager';
import { SlidesInfoHook } from '../../../shared/utils/use-slides-info';
import { FloatTrailerService } from '../../services/float-trailer/float-trailer.service';
import { ApiService } from '../../services/API/api.service';
import { Serie } from '../../interfaces/serie/serie.interface';
import { getKeyTrailer } from '../../../shared/utils/helpers';
import { WindowService } from '../../services/window/window.service';
import { useSlideExpansion } from '../../../shared/utils/use-slide-expansion';

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
  private readonly windowService = inject(WindowService)

  private readonly cardElement: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;

  readonly slideInfo = input.required<SlidesInfoHook>()
  readonly serie = input.required<Serie>()
  readonly cardIndex = input<number>()
  readonly activeIndex = input<number>()

  readonly expanded = output<HTMLElement>();
  readonly collapse = output<HTMLElement>();

  private readonly poster = contentChild.required<ElementRef<HTMLElement>>('posterImage')
  private readonly backdrop = contentChild.required<ElementRef<HTMLElement>>('backdropImage')
  private readonly portalHost = contentChild.required<CdkPortalOutlet>(CdkPortalOutlet)

  private readonly posterElement = computed(() => this.poster().nativeElement);
  private readonly backdropElement = computed(() => this.backdrop().nativeElement);
  private readonly parentElement = computed(() => this.cardElement.parentElement);

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
      this.changeWidthSlide(this.slideInfo().layout().expandedSlideSize, '0s')
      this.animateImageChange(0, '0s');
      if (slideElement) this.expanded.emit(slideElement)
      this.attachTrailer()
    }, 300)
  }

  private getDetailsSerie() {
    this.api.getDetailsSerie({ dataId: this.serie().id }).subscribe((detailsSerie) => {
      this.serie().external_ids = detailsSerie.external_ids
      this.serie().videos = detailsSerie.videos
      this.cdr.markForCheck()
    })
  }

  private changeWidthSlide(width: number, delay: string) {
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
    this.floatTrailer.showTrailerEmbed(key, this.portalHost());
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.timerManager.clearAllTimeouts()
    this.timerManager.clearAllAnimationFrames()
    this.resetSlide()
  }

  private resetSlide() {
    const slideElement = this.parentElement()
    this.floatTrailer.detachTrailerEmbed()
    this.changeWidthSlide(this.slideInfo().layout().slideMainAxisSize, '300ms')
    this.animateImageChange(1, '300ms')
    if (slideElement) this.collapse.emit(slideElement)
  }
}
