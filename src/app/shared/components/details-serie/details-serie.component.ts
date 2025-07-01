import { Component, ElementRef, signal, ViewChild, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { map, concatAll } from 'rxjs';
import { SwiperContainer } from 'swiper/element';
import { Credits, Serie } from '../../interfaces/interfaces';
import { ApiService } from '../../services/API/api.service';
import { ComunicatorService } from '../../services/comunicator/comunicator.service';

@Component({
  selector: 'app-details-serie',
  imports: [],
  templateUrl: './details-serie.component.html',
  styleUrl: './details-serie.component.css'
})
export default class DetailsSerieComponent {
  serie: WritableSignal<Serie | undefined> = signal(undefined)
  credits: WritableSignal<Credits | undefined> = signal(undefined)
  @ViewChild('swiper', { static: false }) swiperContainer!: ElementRef<SwiperContainer>

  constructor(private rutaActiva: ActivatedRoute, private API: ApiService, 
    private comunicatorService: ComunicatorService) {
    this.comunicatorService.setBackgroundNav(true)
    this.getDetailsserie()
    /* this.getCreditsserie() */
  }

  getDetailsserie() {
    let detailsserie$ = this.rutaActiva.params.pipe(
      map((params: Params) => this.API.getDetailsSerie(params['id_serie'])), concatAll())

    detailsserie$.subscribe((serie: Serie) => {
      document.scrollingElement?.scrollTo(0, 0)
      this.serie.set(serie)
    })

  }

  getCreditsserie() {
    /* let creditsserie$ = this.rutaActiva.params.pipe(
      map((params: Params) => this.API.getCreditsserie(params['id_serie'])), concatAll())
    creditsserie$.subscribe((credits: Credits) => this.credits.set(credits)) */

  }
}
