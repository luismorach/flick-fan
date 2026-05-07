import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params, } from '@angular/router';
import { concatAll, map, of, Subscription, switchMap } from 'rxjs';
import { DOCUMENT, NgOptimizedImage, } from '@angular/common';
import { fade } from '../../shared/animations/animations';
import { UrlSafePipe } from '../../shared/pipes/url-safe/url-safe.pipe';
import { ApiService } from '../../core/services/API/api.service';
import { ComunicatorService } from '../../core/services/comunicator/comunicator.service';
import { MovieList } from '../../core/interfaces/movie/movie.interface';
import { CarouselMoviesComponent } from '../../shared/components/carousel/carousel-movies/carousel-movies.component';
import { CarouselMoviesSkeletonComponent } from '../../shared/components/carousel/carousel-movies/carousel-skeleton/carousel-movies-skeleton.component';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-play-movie',
  imports: [UrlSafePipe, NgOptimizedImage, CarouselMoviesComponent, CarouselMoviesSkeletonComponent],
  templateUrl: './play-movie.component.html',
  styleUrl: './play-movie.component.css',
  animations: [fade]
})

export default class PlayMovieComponent {
  similarMovies: WritableSignal<MovieList | undefined> = signal(undefined)
  recomendedMovies: WritableSignal<MovieList | undefined> = signal(undefined)
  private subscriptions: Subscription[] = []
  private doc = inject(DOCUMENT)
  private activeRoute = inject(ActivatedRoute)
  private api = inject(ApiService)

  private id_movie = toSignal(
    this.activeRoute.params.pipe(
      map(params => params['id_movie'])),
    { initialValue: undefined }
  );

  movie = toSignal(
    toObservable(this.id_movie).pipe(
      switchMap(id => this.api.getDetailsMovie({ dataId: id }))),
    { initialValue: undefined }
  );

  url_movie = toSignal(
    toObservable(this.id_movie).pipe(
      switchMap(id => of(`https://vidsrc.to/embed/movie/${id}`))),
    { initialValue: '' }
  );



  constructor(private comunicatorService: ComunicatorService) {

    this.comunicatorService.setBackgroundNav(true)
  }

  
/* 
  getSimilarMovies() {
    this.subscription.push(this.rutaActiva.params.pipe(
      map((params: Params) => this.API.getSimilarMovies(
        {
          page: 1,
          dataId: params['id_movie']
        })), concatAll())
      .subscribe((movies: any) => {
        if (movies.results.length > 0) {
          this.similarMovies.set(movies)
        }
      }))
  }

  getRecomendedMovies() {
    this.subscription.push(this.rutaActiva.params.pipe(
      map((params: Params) => this.API.getRecomendedMovies(
        {
          page: 1, dataId: params['id_movie']
        })), concatAll())
      .subscribe((movies: any) => {
        if (movies.results.length > 0) {
          this.recomendedMovies.set(movies)
        }
      }))
  } */






  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })
  }
}
