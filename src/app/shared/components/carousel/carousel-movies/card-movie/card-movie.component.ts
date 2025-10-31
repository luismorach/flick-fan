import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, input, Renderer2, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Movie } from '../../../../../core/interfaces/movie/movie.interface';
import { IconComponent } from '../../../../icon/icon.component';
import { AutoImagePipe } from '../../../../pipes/autoimage/auto-image.pipe';
import { MinutesToTimePipe } from '../../../../pipes/minutes-to-time/minutes-to-time.pipe';
import { getKeyTrailer } from '../../../../utils/helpers';
import { TimerManager } from '../../../../utils/timer-manager';
import { PlayTrailerEmbeedComponent } from '../../../play-trailer-embeed/play-trailer-embeed.component';

@Component({
  selector: 'app-card-movie',
  standalone: true,
  imports: [NgOptimizedImage, CommonModule, DatePipe, MinutesToTimePipe, RouterLink,
    PlayTrailerEmbeedComponent, IconComponent, AutoImagePipe],
  templateUrl: './card-movie.component.html',
  styleUrls: ['./card-movie.component.css']
})
export class CardMovieComponent {
  movie = input.required<Movie>();
  private videoId = ''
  @ViewChild('movieCard') movieCard!: ElementRef<HTMLElement>
  @ViewChild(PlayTrailerEmbeedComponent) trailerEmbed!: PlayTrailerEmbeedComponent
  @ViewChild(PlayTrailerEmbeedComponent, { read: ElementRef }) trailerEmbedElement !: ElementRef

  constructor(private renderer: Renderer2,private timerManager:TimerManager) { }

  ngAfterViewInit() {
    this.videoId = getKeyTrailer(this.movie());
  }

  handleMouseEnterCard() {
    if (this.videoId === '') return

    this.renderer.appendChild(this.movieCard.nativeElement.firstChild,
      this.trailerEmbedElement.nativeElement)
    this.trailerEmbed.setPlayerVideoData(this.videoId)
    this.renderer.setStyle(this.movieCard.nativeElement, 'z-index', '10')

   this.timerManager.addAnimationFrame(() => {
      this.renderer.addClass(this.trailerEmbedElement.nativeElement, 'active')
    })
  }

  handleMouseLeaveCard() {
    if (this.videoId === '') return
    this.closeTrailerPlayer()
    this.timerManager.clearAllAnimationFrames()
  }

  closeTrailerPlayer() {
    this.renderer.removeClass(this.trailerEmbedElement.nativeElement, 'active')
    this.renderer.removeChild(this.movieCard.nativeElement.firstChild,
      this.trailerEmbedElement.nativeElement)
    this.trailerEmbed.destroy()
  }
}
