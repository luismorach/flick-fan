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
    let changeSizeTrailer = this.animationsService.changeSize({
      duration:'200ms',
      startWidth:'100%',
      startHeight:'100%',
      endWidth:'45%',
      endHeight:'35%'
    }).create(this.trailerElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animationsService.changeSize({
      duration:'200ms',
      startWidth:'90%',
      startHeight:'70%',
      endWidth:'100%',
      endHeight:'100%'
    }) .create(this.videoElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animationsService.changeX({
      duration:'200ms',
      startPosition:'0',
      endPosition:'65%'
    }).create(this.trailerElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animationsService.changeY({
      duration:'200ms',
      startPosition:'0',
      endPosition:'55%'
    }) .create(this.trailerElement()?.nativeElement)
    changeSizeTrailer.play()
  }

  maximize() {
    let changeSizeTrailer = this.animationsService.changeSize({
      duration:'200ms',
      startWidth:'45%',
      startHeight:'35%',
      endWidth:'100%',
      endHeight:'100%'
    }).create(this.trailerElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animationsService.changeSize({
      duration:'200ms',
      startWidth:'100%',
      startHeight:'100%',
      endWidth:'90%',
      endHeight:'70%'
    }).create(this.videoElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animationsService.changeX({
      duration:'200ms',
      startPosition:'65%',
      endPosition:'0%'
    }).create(this.trailerElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animationsService.changeY({
      duration:'200ms',
      startPosition:'55%',
      endPosition:'0%'
    }) .create(this.trailerElement()?.nativeElement)
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
