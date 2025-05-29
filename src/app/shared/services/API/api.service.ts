import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { listMovies, Movie } from '../../interfaces/interfaces';
import {  concatMap, map, mergeAll, mergeMap, Observable, tap, toArray } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  http = inject(HttpClient)
  API = 'https://api.themoviedb.org/3/'

  joinDetailsMovie(observable: Observable<object>) {
    let details = observable.pipe(
      map((data: any) => data.results),
      mergeMap((data: any) => data),
      concatMap((movie: any) => {
        return this.http.get(this.API + 'movie/' + movie.id + '?append_to_response=videos&language=es-VE')
      }),
      toArray(),
    )

    let fusion = observable.pipe(
      map((data: any) => details.pipe(
        map((movies: any) => {
          data.results= movies
          return {page:data.page,total_pages: data.total_pages, total_results:data.total_results, results:movies}
        }),
      )), mergeAll())

    return fusion
  }

  joinDetailsSeries(observable: Observable<object>) {
    let details = observable.pipe(
      map((data: any) => data.results),
      mergeMap((data: any) => data),
      concatMap((serie: any) => {
        return this.http.get(this.API + 'tv/' + serie.id + '?append_to_response=videos&language=es-VE')
      }),
      toArray(),
    )

    let fusion = observable.pipe(
      map((data: any) => details.pipe(
        map((series: any) => {
          data.results= series
          return {page:data.page,total_pages: data.total_pages, total_results:data.total_results, results:series}
        }),
      )), mergeAll())

    return fusion
  }

  getNowPlaying() {
    let nowPlaying = (this.http.get(this.API + 'movie/now_playing?language=es-VE&page=1') as Observable<listMovies>)
    return  this.joinDetailsMovie(nowPlaying)
  }

  getPopular() {
    let popularMovies = this.http.get(this.API + 'movie/popular?language=es-VE&page=1')
    return  this.joinDetailsMovie(popularMovies)
  }

  getUpcoming() {
    let upcomingMovies = this.http.get(this.API + 'movie/upcoming?language=es-VE&page=1')
    return  this.joinDetailsMovie(upcomingMovies)
  }

  getDetailsMovie(movie_id: number) {
    return this.http.get(this.API + 'movie/' + movie_id + '?append_to_response=videos&language=es-VE')
  }

  getCreditsMovie(movie_id: number) {
    return this.http.get(this.API + 'movie/' + movie_id + '/credits?language=es-VE')
  }

  getSimilarMovies(movie_id: number) {
    let similarMovies = this.http.get(this.API + 'movie/' + movie_id + '/similar?language=es-VE')
    return  this.joinDetailsMovie(similarMovies)
  }
  
  getRecomendedMovies(movie_id:number){
    let recomendations=this.http.get(this.API + 'movie/' + movie_id + '/recommendations?language=es-VE')
    return this.joinDetailsMovie(recomendations)
  }

  getAiringTodaySeries(){
    let airingToday = this.http.get(this.API + 'tv/airing_today?language=es-VE&page=1')
    return this.joinDetailsSeries(airingToday)
  }
  
}
