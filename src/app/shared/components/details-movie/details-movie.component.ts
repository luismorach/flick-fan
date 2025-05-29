import { Component, CUSTOM_ELEMENTS_SCHEMA, Signal} from '@angular/core';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { ApiService } from '../../services/API/api.service';
import { ComunicatorService } from '../../services/comunicator/comunicator.service';
import { concatAll, map } from 'rxjs/operators';
import { Credits, Movie } from '../../interfaces/interfaces';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { CurrencyPipe, DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { register } from 'swiper/element';
register();

@Component({
  selector: 'app-details-movie',
  imports: [DatePipe,NgOptimizedImage,DecimalPipe,CurrencyPipe,RouterLink],
  templateUrl: './details-movie.component.html',
  styleUrl: './details-movie.component.css',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
})
export default class DetailsMovieComponent {
  movie!:Signal<Movie | undefined>
  credits!:Signal<Credits | undefined>

  constructor(private rutaActiva: ActivatedRoute, private api: ApiService,private comunicatorService: ComunicatorService) {
    this.comunicatorService.setBackgroundNav(true)
    this.getDetailsMovie()
    this.getCreditsMovie()
    document.scrollingElement?.scrollTo(0, 0)
  }

  getDetailsMovie() {
    let detailsMovie$=this.rutaActiva.params.pipe(
      map((params: Params) => this.api.getDetailsMovie(params['id_movie']) ), concatAll())
    this.movie=toSignal((detailsMovie$ as Observable<Movie>))
  }

  getCreditsMovie() {
    let creditsMovie$=this.rutaActiva.params.pipe(
      map((params: Params) => this.api.getCreditsMovie(params['id_movie']) ), concatAll())
    this.credits=toSignal((creditsMovie$ as Observable<Credits>))
  }
}
