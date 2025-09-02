import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, input, Renderer2, ViewChild } from '@angular/core';
import { Movie } from '../../../interfaces/interfaces';
import { MinutesToTimePipe } from '../../../pipes/minutes-to-time.pipe';
import { getWideImage } from '../../../utils//images-by-default';
import { RouterLink } from '@angular/router';
import { clearAllAnimationsFrame, getKeyTrailer, getKeyTrailerOf, startAnimationFrame } from '../../../utils/carousel';
import { PlayTrailerEmbeedComponent } from '../../play-trailer-embeed/play-trailer-embeed.component';

@Component({
  selector: 'app-movie-carousel',
  standalone: true,
  imports: [NgOptimizedImage, CommonModule, DatePipe, MinutesToTimePipe, RouterLink,
    PlayTrailerEmbeedComponent],
  templateUrl: './movie-carousel.component.html',
  styleUrls: ['./movie-carousel.component.css']
})
export class MovieCarouselComponent {
  getWideImage = getWideImage
  movie = input.required<Movie>();
  isHovered = false
  numSlides: number = 1
  @ViewChild('main') mainContainer!: ElementRef<HTMLElement>
  @ViewChild(PlayTrailerEmbeedComponent) trailerEmbeed!: PlayTrailerEmbeedComponent
  @ViewChild(PlayTrailerEmbeedComponent, { read: ElementRef }) trailerEmbeedElement !: ElementRef

  constructor(private renderer: Renderer2) { }

  onMouseEnterToSlide( id: number) {
    let videoId = getKeyTrailerOf(this.movie());
    /*  this.hoverStates[index] = true;
     this.currentIndex = index */
     this.isHovered=true
    if (videoId === '') return

    this.renderer.appendChild(this.mainContainer.nativeElement.firstChild,
      this.trailerEmbeedElement.nativeElement)
    this.trailerEmbeed.setPlayerVideoData(videoId, id)
    this.renderer.setStyle(this.mainContainer.nativeElement,'z-index','100')

    startAnimationFrame(() => {
      this.renderer.addClass(this.trailerEmbeedElement.nativeElement, 'active')
    })
  }

  onMouseLeaveToSlide() {
    let videoId = getKeyTrailerOf(this.movie());
    /* this.hoverStates[index] = false; */
    this.isHovered=false

    if (videoId === '') return

    this.closeTrailerPlayer()
    clearAllAnimationsFrame()
  }
  closeTrailerPlayer() {
    this.renderer.removeClass(this.trailerEmbeedElement.nativeElement, 'active')
    this.renderer.removeChild(this.mainContainer.nativeElement.firstChild,
      this.trailerEmbeedElement.nativeElement)
    this.trailerEmbeed.destroy()
  }

}
