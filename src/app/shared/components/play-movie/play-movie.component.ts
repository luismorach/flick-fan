import { Component, HostListener, inject, input, Signal, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { UrlSafePipe } from '../../pipes/url-safe.pipe';
import { concatAll, map, Observable, Subscription, toArray } from 'rxjs';
import { ApiService } from '../../services/API/api.service';
import { listMovies, Movie } from '../../interfaces/interfaces';
import { DatePipe, DecimalPipe, DOCUMENT, NgOptimizedImage, NgStyle } from '@angular/common';
import { RatingComponent } from '../rating/rating.component';
import { ComunicatorService } from '../../services/comunicator/comunicator.service';
import { AnimationsService } from '../../services/animations/animations.service';
import { carrouselComponent } from '../carrousel/carrousel.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-play-movie',
  imports: [UrlSafePipe, NgOptimizedImage, RatingComponent, DatePipe, DecimalPipe, NgStyle, RouterLink, RatingComponent, carrouselComponent],
  templateUrl: './play-movie.component.html',
  styleUrl: './play-movie.component.css'
})

export default class PlayMovieComponent {
  movie: WritableSignal<any | undefined> = signal(undefined)
  url_movie = signal('https://vidsrc.to/embed/movie/')
  similarMovies: WritableSignal<listMovies | undefined> = signal(undefined)
  recomendedMovies: WritableSignal<listMovies | undefined> = signal(undefined)
  subscription: Subscription[] = []
  doc = inject(DOCUMENT)

  constructor(private rutaActiva: ActivatedRoute, private api: ApiService,
    private comunicatorService: ComunicatorService, private animationsService: AnimationsService) {

    this.comunicatorService.setBackgroundNav(true)
    this.getUrlMovie()
    this.getSimilarMovies()
    this.getRecomendedMovies()
  }

  getUrlMovie() {
    this.subscription.push(this.rutaActiva.params.pipe(
      map((params: Params) => this.api.getDetailsMovie(params['id_movie'])), concatAll())
      .subscribe((movie: any) => {
        this.doc.scrollingElement?.scrollTo(0, 0)
        this.url_movie.set('https://vidsrc.to/embed/movie/' + movie.imdb_id)
        this.movie.set(movie)
      }))
  }
  
  getSimilarMovies() {
    this.subscription.push(this.rutaActiva.params.pipe(
      map((params: Params) => this.api.getSimilarMovies(params['id_movie'])), concatAll())
      .subscribe((movies: any) => {
        if (movies.results.length > 0) {
          this.similarMovies.set(movies)
        }
      }))
  }

  getRecomendedMovies() {
    this.subscription.push(this.rutaActiva.params.pipe(
      map((params: Params) => this.api.getRecomendedMovies(params['id_movie'])), concatAll())
      .subscribe((movies: any) => {
        if (movies.results.length > 0) {
          this.recomendedMovies.set(movies)
        }
      }))
  }

  ngOndestroy() {
    console.log('destroing')
    this.subscription.forEach(subscription => {
      subscription.unsubscribe()
    })
  }
}
