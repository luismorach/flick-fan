import { Component, HostListener, inject, input, Signal, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { UrlSafePipe } from '../../pipes/url-safe.pipe';
import { concatAll, map, Subscription, toArray } from 'rxjs';
import { ApiService } from '../../services/API/api.service';
import { Movie } from '../../interfaces/interfaces';
import { DatePipe, DecimalPipe, DOCUMENT, NgOptimizedImage, NgStyle } from '@angular/common';
import { RatingComponent } from '../rating/rating.component';
import { ComunicatorService } from '../../services/comunicator/comunicator.service';
import { AnimationsService } from '../../services/animations/animations.service';

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
  offset:WritableSignal<number>=signal(0)

  doc = inject(DOCUMENT)
  
 /*  @HostListener("window:scroll", ['$event'])
  doSomething(event: any) {
    console.log("scrolling")
    this.offset.set((this.doc.scrollingElement) ? this.doc.scrollingElement.scrollTop : 0)
    if(this.offset()===700)
      this.offset.set(700)
  } */

  constructor(private rutaActiva: ActivatedRoute, private api: ApiService, 
    private comunicatorService:ComunicatorService,private animationsService: AnimationsService) {

    this.comunicatorService.setBackgroundNav(true)
    this.getUrlMovie()
    this.getSimilarMovies()
  }

  getUrlMovie() {
    this.subscription.push(this.rutaActiva.params.pipe(
      map((params: Params) => this.api.getDetailsMovie(params['id_movie'])), concatAll())
      .subscribe((movie: any) => {
        this.doc.scrollingElement?.scrollTo(0,0)
        this.url_movie.set( 'https://vidsrc.to/embed/movie/'+ movie.imdb_id)
        this.movie.set(movie)
      }))
  }
  getSimilarMovies() {
    this.subscription.push( 
    this.rutaActiva.params.pipe(
      map((params: Params) => this.api.getSimilarMovies(params['id_movie'])), concatAll())
      .subscribe((movies: any) => {
        this.similarMovies.set(movies.results)
      console.log(movies)
    }) )
  }
up(){
  this.doc.scrollingElement?.scrollTo(0,0)
}
  ngOndestroy() {
    console.log('destroing')
    this.subscription.forEach(subscription=>{
      subscription.unsubscribe()
    })
  }
}
