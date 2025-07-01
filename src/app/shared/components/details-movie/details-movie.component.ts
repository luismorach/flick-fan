import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, signal,  ViewChild,  WritableSignal } from '@angular/core';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { ApiService } from '../../services/API/api.service';
import { ComunicatorService } from '../../services/comunicator/comunicator.service';
import { concatAll, map } from 'rxjs/operators';
import { Credits, Movie } from '../../interfaces/interfaces';
import { CurrencyPipe, DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { register, SwiperContainer } from 'swiper/element/bundle'
import 'swiper/css'
register();

@Component({
  selector: 'app-details-movie',
  imports: [DatePipe, NgOptimizedImage, DecimalPipe, CurrencyPipe, RouterLink],
  templateUrl: './details-movie.component.html',
  styleUrl: './details-movie.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class DetailsMovieComponent {
  movie: WritableSignal<Movie | undefined> = signal(undefined)
  credits: WritableSignal<Credits | undefined> = signal(undefined)
  @ViewChild('swiper', { static: false }) swiperContainer!: ElementRef<SwiperContainer>

  constructor(private rutaActiva: ActivatedRoute, private api: ApiService, private comunicatorService: ComunicatorService) {
    this.comunicatorService.setBackgroundNav(true)
    this.getDetailsMovie()
    this.getCreditsMovie()
  }

  getDetailsMovie() {
    let detailsMovie$ = this.rutaActiva.params.pipe(
      map((params: Params) => this.api.getDetailsMovie(params['id_movie'])), concatAll())

    detailsMovie$.subscribe((movie: Movie) => {
      document.scrollingElement?.scrollTo(0, 0) 
      this.movie.set(movie)
    })

  }

  getCreditsMovie() {
    let creditsMovie$ = this.rutaActiva.params.pipe(
      map((params: Params) => this.api.getCreditsMovie(params['id_movie'])), concatAll())
    creditsMovie$.subscribe((credits: Credits) => this.credits.set(credits))

  }
}
