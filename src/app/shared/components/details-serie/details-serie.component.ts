import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Renderer2, signal, ViewChild, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { map, concatAll } from 'rxjs';
import { register, SwiperContainer } from 'swiper/element/bundle';
import { Credits, season, Serie } from '../../interfaces/interfaces';
import { ApiService } from '../../services/API/api.service';
import { ComunicatorService } from '../../services/comunicator/comunicator.service';
import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { getRange } from '../../utils/carousel';
import { getWideImage, getTallImage } from '../../utils/images-by-default';

register()
@Component({
  selector: 'app-details-serie',
  imports: [RouterLink, NgOptimizedImage, DatePipe, DecimalPipe],
  templateUrl: './details-serie.component.html',
  styleUrl: './details-serie.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class DetailsSerieComponent {
  serie: WritableSignal<Serie | undefined> = signal(undefined)
  credits: WritableSignal<Credits | undefined> = signal(undefined)
  isLiked = false;
  isBookmarked = false;
  @ViewChild('swiper', { static: false }) swiperContainer!: ElementRef<SwiperContainer>
  getTallImage = getTallImage
  getWideImage = getWideImage

  constructor(private rutaActiva: ActivatedRoute, private API: ApiService,
    private comunicatorService: ComunicatorService, private renderer: Renderer2) {
    this.comunicatorService.setBackgroundNav(true)
    this.getDetailsSerie()
    this.getCreditsSerie()
  }

  ngAfterViewInit() {
    const swiperEl = document.querySelector('swiper-container');
    console.log(swiperEl?.swiper.navigation.nextEl)
    const button_next = swiperEl?.swiper.navigation.nextEl
    const button_prev = swiperEl?.swiper.navigation.prevEl
    this.renderer.setStyle(button_next, 'opacity', '0')
    this.renderer.setStyle(button_prev, 'opacity', '0')
  }

  swiperInit(event: any) {
    setTimeout(() => {
      console.log('iniciado', event.detail[0].navigation.nextEl)
      const button_next = event.detail[0].navigation.nextEl
      const button_prev = event.detail[0].navigation.prevEl
      this.renderer.setStyle(button_next, 'opacity', '0')
      this.renderer.setStyle(button_prev, 'opacity', '0')
    })
  }

  swiperSlide(event: any) {
    console.log('desplazando slide')
    this.onSlideMouse(event, 1)
  }

  onSlideMouse(event: any, opacity: number) {
    const isBeginning = event.target.swiper.isBeginning
    const isEnd = event.target.swiper.isEnd
    console.log(isBeginning)
    const button_next = event.target.swiper.navigation.nextEl
    const button_prev = event.target.swiper.navigation.prevEl;

    (isBeginning) ? this.renderer.setStyle(button_prev, 'opacity', 0) :
      this.renderer.setStyle(button_prev, 'opacity', opacity);

    (isEnd) ? this.renderer.setStyle(button_next, 'opacity', 0) :
      this.renderer.setStyle(button_next, 'opacity', opacity)
  }

  getDetailsSerie() {
    let detailsserie$ = this.rutaActiva.params.pipe(
      map((params: Params) => this.API.getDetailsSerie(params['id_serie'])), concatAll())

    detailsserie$.subscribe((serie: Serie) => {
      console.log(serie)
      document.scrollingElement?.scrollTo(0, 0)
      this.serie.set(serie)
    })
  }

  getCreditsSerie() {
    let creditsserie$ = this.rutaActiva.params.pipe(
      map((params: Params) => this.API.getCreditsSerie(params['id_serie'])), concatAll())
    creditsserie$.subscribe((credits: Credits) => this.credits.set(credits))

  }

  getBackgroundImage(): string {
    return `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(http://image.tmdb.org/t/p/original${this.serie()?.backdrop_path})`;
  }

  toggleLike(): void {
    this.isLiked = !this.isLiked;
  }

  toggleBookmark(): void {
    this.isBookmarked = !this.isBookmarked;
  }

  getLikeButtonClass(): string {
    return `p-3 rounded-full border-2 transition-all transform hover:scale-110 ${this.isLiked
      ? 'bg-red-500 border-red-500 text-white'
      : 'border-white/30 text-white hover:border-red-500 hover:text-red-500'
      }`;
  }

  getBookmarkButtonClass(): string {
    return `p-3 rounded-full border-2 transition-all transform hover:scale-110 ${this.isBookmarked
      ? 'bg-red-500 border-red-500 text-white'
      : 'border-white/30 text-white hover:border-red-500 hover:text-red-500'
      }`;
  }
}



