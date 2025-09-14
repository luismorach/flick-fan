import { Component, ElementRef, input, Renderer2, ViewChild } from '@angular/core';
import { Movie, Serie } from '../../../../core/interfaces/interfaces';
import { PlayTrailerEmbeedComponent } from '../../play-trailer-embeed/play-trailer-embeed.component';
import { startTimeOut, startAnimationFrame, getKeyTrailer, clearAllTimeouts, clearAllAnimationsFrame, waitForTransitionEnd, waitForAnimationFrame, getKeyTrailerOf } from '../../../utils/helpers';
import { getTallImage, getWideImage } from '../../../utils/images-by-default';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-serie',
  imports: [PlayTrailerEmbeedComponent,NgOptimizedImage,DecimalPipe,RouterLink],
  templateUrl: './card-serie.component.html',
  styleUrl: './card-serie.component.css'
})
export class CardSerieComponent {
  serie = input.required<Serie>();
  numSlides: number = 1
  slideWidth = 288
  @ViewChild('main') mainContainer!: ElementRef<HTMLElement>
  @ViewChild(PlayTrailerEmbeedComponent) trailerEmbeed!: PlayTrailerEmbeedComponent
  @ViewChild(PlayTrailerEmbeedComponent, { read: ElementRef }) trailerEmbeedElement !: ElementRef
  getTallImage = getTallImage
  getWideImage = getWideImage

  constructor(private renderer2: Renderer2) { }

  async onMouseEnterToSlide() {
    const slide = this.mainContainer.nativeElement
    startTimeOut(async () => {
      this.expandSlide(slide)
      this.animateImageChange(slide, 0, 1);
      this.moveAndPlayTrailer(slide, 0)
    }, 300)
  }

  private expandSlide(slide: HTMLElement) {
    startAnimationFrame(() => {
      this.renderer2.setStyle(slide, 'width', `${Math.floor(this.slideWidth * 2.8)}px`)
      this.renderer2.setStyle(slide, 'transition', 'width .3s cubic-bezier(.2,.45,0,1)')
    })
  }

  private animateImageChange(slide: HTMLElement, posterOpacity: number, hoverOpacity: number) {
    const poster = slide.children[0]
    const hover = slide.children[1]

    if (!poster && !hover) return

    startAnimationFrame(() => {
      this.renderer2.setStyle(poster, 'transition', 'opacity .3s cubic-bezier(.2,.45,0,1)')
      this.renderer2.setStyle(poster, 'opacity', `${posterOpacity}`);
      this.renderer2.setStyle(hover, 'transition', 'opacity .3s cubic-bezier(.2,.45,0,1)')
      this.renderer2.setStyle(hover, 'opacity', `${hoverOpacity}`);
    })
  }

  private moveAndPlayTrailer(slide: HTMLElement, id: number) {
    let videoId = getKeyTrailerOf(this.serie());

    if (videoId === '') return

    this.renderer2.appendChild(slide, this.trailerEmbeedElement.nativeElement);
    this.trailerEmbeed.setPlayerVideoData(videoId, id)
    startTimeOut(() => {
      this.renderer2.addClass(this.trailerEmbeedElement.nativeElement, 'active')
    },3000)
  }

  onMouseLeaveToSlide() {
    clearAllTimeouts()
    clearAllAnimationsFrame()
    this.resetSlide()
  }

  private resetSlide() {
    const slide = this.mainContainer.nativeElement

    this.closeTrailerPlayer()

    setTimeout(async () => {
      this.collapseSlide(slide)
      this.animateImageChange(slide, 1, 0)

      await waitForTransitionEnd(slide)
      await waitForAnimationFrame()
    }, 300)
  }

  closeTrailerPlayer() {
    this.renderer2.removeClass(this.trailerEmbeedElement.nativeElement, 'active')
    this.renderer2.removeChild(this.mainContainer.nativeElement,
      this.trailerEmbeedElement.nativeElement)
    this.trailerEmbeed.destroy()
  }

  collapseSlide(slide: HTMLElement) {
    startAnimationFrame(() => {
      this.renderer2.setStyle(slide, 'width', `${this.slideWidth}px`);
    })
  }
}
