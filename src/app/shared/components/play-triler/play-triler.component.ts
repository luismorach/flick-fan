import { AfterViewInit, Component, ElementRef, Injector, Renderer2, Signal, WritableSignal, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UrlSafePipe } from '../../pipes/url-safe.pipe';
import { NgClass } from '@angular/common';
import { AnimationsService } from '../../services/animations.service';

@Component({
  selector: 'app-play-triler',
  standalone: true,
  imports: [UrlSafePipe, NgClass],
  templateUrl: './play-triler.component.html',
  styleUrl: './play-triler.component.css'
})
export default class PlayTrilerComponent implements AfterViewInit {
  animations = inject(AnimationsService)

  videoKey = input<string>();
  trailerElement = viewChild<ElementRef>('trailer')
  videoElement = viewChild<ElementRef>('video')
  urlSafe = computed(() => {
    return 'https://www.youtube.com/embed/' + this.videoKey() + '?rel=0'
  })
  isClosed: WritableSignal<boolean> = signal(false)
  minimized: WritableSignal<boolean> = signal(false)
  constructor() { }

  ngAfterViewInit(): void {
    // this.trailerElement()?.nativeElement.showModal()
  }

  render() {
    console.log('*****RENDER TRAILER********')
  }
  minimize() {
    let changeSizeTrailer = this.animations.changeSize('100ms', '0ms', '100%', '100%', '35%', '45%')
      .create(this.trailerElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animations.changeSize('100ms', '0ms', '70%', '90%', '100%', '100%')
      .create(this.videoElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animations.changeX('100ms', '0ms', '0', '65%')
      .create(this.trailerElement()?.nativeElement)
    changeSizeTrailer.play()

    changeSizeTrailer = this.animations.changeY('100ms', '0ms', '0', '55%')
      .create(this.trailerElement()?.nativeElement)
    changeSizeTrailer.play()
  }
  maximize() {
    if ((!this.isClosed())) {
      let changeSizeTrailer = this.animations.changeSize('100ms', '0ms', '35%', '45%', '100%', '100%')
        .create(this.trailerElement()?.nativeElement)
      changeSizeTrailer.play()

      changeSizeTrailer = this.animations.changeSize('100ms', '0ms', '100%', '100%', '70%', '90%')
        .create(this.videoElement()?.nativeElement)
      changeSizeTrailer.play()

      changeSizeTrailer = this.animations.changeX('100ms', '0ms', '65%', '0')
        .create(this.trailerElement()?.nativeElement)
      changeSizeTrailer.play()

      changeSizeTrailer = this.animations.changeY('100ms', '0ms', '55%', '0')
        .create(this.trailerElement()?.nativeElement)
      changeSizeTrailer.play()
    }
    this.isClosed.set(false)
  }
  close() {
    console.log('****cerrando')
    this.isClosed.set(true)
  }
}
