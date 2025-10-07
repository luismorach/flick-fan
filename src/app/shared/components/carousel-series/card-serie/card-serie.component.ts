import { Component, ElementRef, input, output, Renderer2, ViewChild } from '@angular/core';
import { PlayTrailerEmbeedComponent } from '../../play-trailer-embeed/play-trailer-embeed.component';
import {getKeyTrailer} from '../../../utils/helpers';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Serie } from '../../../../core/interfaces/serie/serie.interface';
import { runTransition } from '../../../utils/transition-manager';
import { TimerManager } from '../../../utils/timer-manager';
import { AutoImagePipe } from '../../../pipes/auto-image.pipe';

@Component({
  selector: 'app-card-serie',
  imports: [PlayTrailerEmbeedComponent, NgOptimizedImage, DecimalPipe, RouterLink,AutoImagePipe],
  templateUrl: './card-serie.component.html',
  styleUrl: './card-serie.component.css'
})
export class CardSerieComponent {
  serie = input.required<Serie>();
  numSlides: number = 1
  hoverEnter = output<HTMLElement>();
  hoverLeave = output<HTMLElement>();
  slideWidth = 288
  @ViewChild('main') mainContainer!: ElementRef<HTMLElement>
  @ViewChild(PlayTrailerEmbeedComponent) trailerEmbeed!: PlayTrailerEmbeedComponent
  @ViewChild(PlayTrailerEmbeedComponent, { read: ElementRef }) trailerEmbeedElement !: ElementRef
  isCardCollapse = true

  constructor(private renderer2: Renderer2, private timerManager:TimerManager) { }

  /* ngAfterViewInit() {
    this.setEventTransition()
  } */
  onMouseEnterToSlide() {
    console.log('entrando al card')
    const slide = this.mainContainer.nativeElement
    this.timerManager.addTimeout(() => {
      this.changeWidthSlide(slide, Math.floor(this.slideWidth * 2.8), '0s')
      this.animateImageChange(slide, 0, 1, '0s');
      this.hoverEnter.emit(slide)
      this.moveAndPlayTrailer(slide, 0)
    }, 300)
  }
  onTransitionStart = (event: TransitionEvent) => {
    const prop = event.propertyName;
    // solo nos interesa width
    if (prop !== 'width' || !this.isCardCollapse) return;
    const slide = this.mainContainer.nativeElement
    console.log('transicion iniciada en card', this.isCardCollapse)
    this.hoverLeave.emit(slide)
  }

  setEventTransition() {
    const slide = this.mainContainer.nativeElement
    slide.addEventListener('transitionstart', this.onTransitionStart, { once: true })
  }

  private changeWidthSlide(slide: HTMLElement, width: number, delay: string) {
    this.isCardCollapse = !this.isCardCollapse
    runTransition(slide, (() => {
      this.renderer2.setStyle(slide, 'transition', `width .3s cubic-bezier(.2,.45,0,1) ${delay}`)
      this.renderer2.setStyle(slide, 'width', `${width}px`)
    }))
  }

  private animateImageChange(slide: HTMLElement, posterOpacity: number,
    hoverOpacity: number, delay: string) {
    const poster = slide.children[0]
    const hover = slide.children[1]

    if (!poster && !hover) return
      this.renderer2.setStyle(poster, 'transition', `opacity .3s cubic-bezier(.2,.45,0,1) ${delay}`)
      this.renderer2.setStyle(poster, 'opacity', `${posterOpacity}`);
      this.renderer2.setStyle(hover, 'transition', `opacity .3s cubic-bezier(.2,.45,0,1) ${delay}`)
      this.renderer2.setStyle(hover, 'opacity', `${hoverOpacity}`);
  }

  private moveAndPlayTrailer(slide: HTMLElement, id: number) {
    let videoId = getKeyTrailer(this.serie());

    if (videoId === '') return

    this.renderer2.appendChild(slide, this.trailerEmbeedElement.nativeElement);
    this.trailerEmbeed.setPlayerVideoData(videoId)
    this.timerManager.addTimeout(() => {
      this.renderer2.addClass(this.trailerEmbeedElement.nativeElement, 'active')
    }, 3000)
  }

  onMouseLeaveToSlide() {
   this.timerManager.clearAllTimeouts()
   this.timerManager.clearAllAnimationFrames()
    this.resetSlide()
  }

  private resetSlide() {
    const slide = this.mainContainer.nativeElement

    this.closeTrailerPlayer()


    //this.renderer2.setStyle(slide,'transition-delay','300ms')
    this.changeWidthSlide(slide, this.slideWidth, '300ms')
    this.animateImageChange(slide, 1, 0, '300ms')
    //this.setEventTransition()
    this.hoverLeave.emit(slide)
  }

  closeTrailerPlayer() {
    this.renderer2.removeClass(this.trailerEmbeedElement.nativeElement, 'active')
    this.renderer2.removeChild(this.mainContainer.nativeElement,
      this.trailerEmbeedElement.nativeElement)
    this.trailerEmbeed.destroy()
  }
}
