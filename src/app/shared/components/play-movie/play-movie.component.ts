import { Component, input, Signal, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { UrlSafePipe } from '../../pipes/url-safe.pipe';
import { concatAll, map, Subscription, toArray } from 'rxjs';
import { ApiService } from '../../services/API/api.service';
import { Movie } from '../../interfaces/interfaces';
import { DatePipe, DecimalPipe, NgOptimizedImage, NgStyle } from '@angular/common';
import { Writable } from 'stream';
import { RatingComponent } from '../rating/rating.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-play-movie',
  imports: [UrlSafePipe, NgOptimizedImage, RatingComponent, DatePipe, DecimalPipe, NgStyle,RouterLink],
  templateUrl: './play-movie.component.html',
  styleUrl: './play-movie.component.css'
})

export default class PlayMovieComponent {
  movie: WritableSignal<any | undefined> = signal(undefined)
  url_movie = signal('https://vidsrc.to/embed/movie/')
  similarMovies: WritableSignal<any> =signal(undefined)
  subscription:Subscription[]=[]

  constructor(private rutaActiva: ActivatedRoute, private api: ApiService) {
    this.subscription.push(this.rutaActiva.params.pipe(
      map((params: Params) => { console.log(params); return this.api.getDetailsMovie(params['id_movie']) }), concatAll())
      .subscribe((movie: any) => {

        this.url_movie.update(url => url += movie.imdb_id)
        this.movie.set(movie)
      }),
      this.rutaActiva.params.pipe(
        map((params: Params) => { console.log(params); return this.api.getSimilarMovies(params['id_movie']) }), concatAll())
        .subscribe((movies: any) => {
          this.similarMovies.set(movies.results)
        console.log(movies)
      })  )
      
     /* console.log(this.similarMovies()) */
  }

  ngOndestroy() {
    this.subscription.forEach(subscription=>{
      subscription.unsubscribe()
    })
  }
}
