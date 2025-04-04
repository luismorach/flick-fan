import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Host, HostListener, inject, Input, input, Renderer2, signal, viewChild, ViewChild } from '@angular/core';
import { register, SwiperContainer } from 'swiper/element/bundle'
import { AllMovies, Movie } from '../../interfaces/interfaces';
import { DatePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { SwiperOptions } from 'swiper/types';
import { ComunicatorService } from '../../services/comunicator/comunicator.service';
import { UrlSafePipe } from '../../pipes/url-safe.pipe';
import { YouTubePlayer } from '@angular/youtube-player';
@Component({
  selector: 'app-carrousel',
  imports: [NgOptimizedImage, DatePipe, NgClass, UrlSafePipe, YouTubePlayer],
  templateUrl: './carrousel.component.html',
  styleUrl: './carrousel.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class carrouselComponent {
  @ViewChild('swiper') swiperContainer!: ElementRef<SwiperContainer>

  trailerElement = viewChild<any>('trailer')
  /* @ViewChild('trailer') trailerElement!: ElementRef<HTMLElement> */
  movies = input.required<Movie[] | undefined>()
  title = input.required<string>()
  hoverStates: { [key: number]: boolean } = {};
  mutedStates: { [key: number]: boolean } = {};
  playerStates: { [key: number]: number } = {};
  numSlides = 4
  isSwiperRegistered = false
  player: any

  constructor(private comunicatorService: ComunicatorService, private renderer2: Renderer2) {
    if (!this.isSwiperRegistered) {
      register(); // Registra Swiper solo una vez
      this.isSwiperRegistered = true;
    }
  }

  initApiYoutube() {
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

  }

  @HostListener("window:scroll", ['$event'])
  enableBackgroundNav(event: any) {
    let offset = event.srcElement.children[0].scrollTop
    if (offset > 20) {
      this.comunicatorService.setBackgroundNav(true)
    } else {
      this.comunicatorService.setBackgroundNav(false)
    }
  }

  ngOnInit() {
    this.initApiYoutube()

  }

  ngAfterViewInit() {
    this.initSwiper()

  }

  initSwiper() {
    const swiperOptions: SwiperOptions = {
      speed: 800,
      slidesPerView: this.numSlides,
      allowTouchMove: false,
      spaceBetween: 15,
      slidesPerGroup: 4,
      observer: true,
      observeParents: true,
      observeSlideChildren: true,
      navigation: {
        enabled: true,
      },
    }

    if (this.swiperContainer) {
      Object.assign(this.swiperContainer.nativeElement, swiperOptions)
      this.swiperContainer.nativeElement?.initialize()
    }

  }
  mouseEnter(index: number) {
    this.hoverStates[index] = true;
    this.mutedStates[index] = true;
    this.createPlayer(index);
  }

  changeMuted(index: number) {
    this.mutedStates[index] = !this.mutedStates[index];
    (this.mutedStates[index]) ? this.player.mute() : this.player.unMute();

  }

  createPlayer(index: number) {
    let movie: any = this.movies();

    console.log(this.getUrlTrailer(index), index)
    this.player = new window['YT'].Player(`trailer${index}`, {
      height: '192',
      width: '312',
      videoId: this.getUrlTrailer(index),
      playerVars: {
        autoplay: 0,
        controls: 0,
        loop: 1,
        showinfo: 1,
        iv_load_policy: 3,
        mute: 1,
      },
      events: {
        'onReady': (event) => this.onReady(event),
        'onStateChange': (event) => this.onStateChange(event, 0),
      }
    });

  }

  mouseLeave(index: number) {
    this.hoverStates[index] = false;
    this.player.destroy();

    document.getElementsByTagName('iframe')[3].referrerPolicy = 'no-referrer';
    document.getElementsByTagName('iframe')[index].contentWindow?.document;
    console.log(document.getElementsByTagName('iframe')[3].contentWindow?.document);
  }


  getUrlTrailer(index: number): string {
    let key: string | undefined;
    let movie: any = this.movies();
    if (movie !== undefined) {
      movie[index].videos?.results.forEach((element: any) => {
        if (element.type === 'Trailer') {
          console.log('key', element.key)
          key = element.key;
        }
      });
    }
    return key ? key : '';
    return key ? `https://www.youtube.com/embed/${key}?enablejsapi=1` : '';
  }

  onReady(event: any) {
    console.log('onReady', event.target);
    this.player.playVideo();
   

  }

  onStateChange(event: any, index: number) {
    this.playerStates[index] = event.data;
    if (event.data == YT.PlayerState.ENDED) {
      this.player.destroy();
    }
  }


}
