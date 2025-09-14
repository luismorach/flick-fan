import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, Renderer2, computed, inject, input, viewChild } from '@angular/core';
import { UrlSafePipe } from '../../pipes/url-safe.pipe';
import { AnimationsService } from '../../../core/services/animations/animations.service';

@Component({
  selector: 'app-play-trailer',
  imports: [UrlSafePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './play-trailer.component.html',
  styleUrl: './play-trailer.component.css'
})


export default class PlayTrailerComponent {
  animationsService = inject(AnimationsService)
  videoKey = input<string>();
  trailerElement = viewChild<ElementRef>('trailer')
  videoElement = viewChild<ElementRef>('video')
  urlSafe = computed(() => {
    console.log(this.videoKey())
    return 'https://www.youtube.com/embed/' + this.videoKey() + '?rel=0'
  })

  constructor(private renderer2: Renderer2) { }

  minimize() {
    let changeSizeTrailer = this.animationsService.changeSize('200ms', '0ms', '100%', '100%', '35%', '45%')
      .create(this.trailerElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animationsService.changeSize('200ms', '0ms', '70%', '90%', '100%', '100%')
      .create(this.videoElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animationsService.changeX('200ms', '0ms', '0', '65%')
      .create(this.trailerElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animationsService.changeY('200ms', '0ms', '0', '55%')
      .create(this.trailerElement()?.nativeElement)
    changeSizeTrailer.play()
  }

  maximize() {
    let changeSizeTrailer = this.animationsService.changeSize('200ms', '0ms', '35%', '45%', '100%', '100%')
      .create(this.trailerElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animationsService.changeSize('200ms', '0ms', '100%', '100%', '70%', '90%')
      .create(this.videoElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animationsService.changeX('200ms', '0ms', '65%', '0')
      .create(this.trailerElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animationsService.changeY('200ms', '0ms', '55%', '0')
      .create(this.trailerElement()?.nativeElement)
    changeSizeTrailer.play()

  }

  openTrailer() {
    if (!document.contains(this.videoElement()?.nativeElement)) {
      this.renderer2.removeClass(this.trailerElement()?.nativeElement, 'invisible')
      this.renderer2.appendChild(this.trailerElement()?.nativeElement, this.videoElement()?.nativeElement)
    }
    this.maximize()
  }

  closeTrailer() {
    this.renderer2.addClass(this.trailerElement()?.nativeElement, 'invisible')
    this.renderer2.removeChild(this.trailerElement()?.nativeElement, this.videoElement()?.nativeElement)
  }
}
