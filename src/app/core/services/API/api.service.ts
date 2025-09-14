import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, inject } from '@angular/core';
import { Credits, listMovies, listSeries, Movie, Serie } from '../../interfaces/interfaces';
import { concatMap, distinct, forkJoin, map, merge, mergeAll, mergeMap, Observable, tap, toArray } from 'rxjs';

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
          data.results = movies
          return { page: data.page, total_pages: data.total_pages, total_results: data.total_results, results: movies }
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
          data.results = series
          return { page: data.page, total_pages: data.total_pages, total_results: data.total_results, results: series }
        }),
      )), mergeAll())

    return fusion
  }

  joinDetailsSeason(observable: Observable<object>, serie_id: number) {
    let details = observable.pipe(
      map((data: any) => data.seasons),
      mergeMap((data: any) => data),
      concatMap((season: any) => {
        return this.http.get(this.API + 'tv/' + serie_id + '/season/' + season.season_number + '?language=es-VE')
      }),
      toArray(),
    )

    let fusion = observable.pipe(
      map((data: any) => details.pipe(
        map((seasons: any) => {
          data.seasons = seasons
          console.log(seasons)
          return { ...data, seasons: seasons }
        }),
      )), mergeAll())

    return fusion
  }

  getNowPlaying(page: number) {
    let nowPlaying = (this.http.get(this.API + `movie/now_playing?language=es-VE&page=${page}`) as Observable<listMovies>)
    return this.joinDetailsMovie(nowPlaying)
  }

  getPopular(page: number) {
    let popularMovies = this.http.get(this.API + `movie/popular?language=es-VE&page=${page}`)
    return this.joinDetailsMovie(popularMovies)
  }

  getUpcoming(page: number) {
    let upcomingMovies = this.http.get(this.API + `movie/upcoming?language=es-VE&page=${page}`)
    return this.joinDetailsMovie(upcomingMovies)
  }

  getDetailsMovie(movie_id: number): Observable<Movie> {
    return this.http.get(this.API + 'movie/' + movie_id + '?append_to_response=videos&language=es-VE') as Observable<Movie>
  }

  getCreditsMovie(movie_id: number): Observable<Credits> {
    return this.http.get(this.API + 'movie/' + movie_id + '/credits?language=es-VE') as Observable<Credits>
  }

  getSimilarMovies(page: number, id_movie: number) {
    let similarMovies = this.http.get(this.API + `movie/ ${id_movie}/similar?language=es-VE&page=${page}`)
    return this.joinDetailsMovie(similarMovies)
  }

  getRecomendedMovies(page: number, id_movie: number) {
    let recomendations = this.http.get(this.API + `movie/${id_movie}/recommendations?language=es-VE&page=${page}`)
    return this.joinDetailsMovie(recomendations)
  }

  getAiringTodaySeries(page: number) {
    let airingToday = this.http.get(this.API + `tv/airing_today?language=es-VE&page=${page}`)
    return this.joinDetailsSeries(airingToday)
  }

  getOnTheAirSeries(page: number) {
    let onTheAirSeries = this.http.get(this.API + `tv/on_the_air?language=es-VE&page=${page}`)
    return this.joinDetailsSeries(onTheAirSeries)
  }
  getPopularSeries(page: number) {
    let popularSeries = this.http.get(this.API + `tv/popular?language=es-VE&page=${page}`)
    return this.joinDetailsSeries(popularSeries)
  }
  getDetailsSerie(serie_id: number): Observable<Serie> {
    let detailsSeason = this.http.get(this.API + 'tv/' + serie_id + '?append_to_response=videos&language=es-VE')
    return this.joinDetailsSeason(detailsSeason, serie_id)
  }

  getCreditsSerie(serie_id: number): Observable<Credits> {
    return this.http.get(this.API + 'tv/' + serie_id + '/credits?language=es-VE') as Observable<Credits>
  }

  getSimilarSeries(page: number, serie_id: number) {
    let similarSeries = this.http.get(this.API + 'tv/' + serie_id + `/similar?language=es-VE&page=${page}`)
    return this.joinDetailsSeries(similarSeries)
  }

  getRecomendedSeries(page: number, serie_id: number) {
    let recomendations = this.http.get(this.API + 'tv/' + serie_id + `/recommendations?language=es-VE&page=${page}`)
    return this.joinDetailsSeries(recomendations)
  }

  searchMovie(page: number,name_movie: string) {
    let movies = this.http.get(this.API + `search/movie?query=${name_movie}&language=es-VE&page=${page}`)
    return this.joinDetailsMovie(movies)
  }
  searchSerie(page: number,name_serie: string) {
    let movies = this.http.get(this.API + `search/tv?query=${name_serie}&language=es-VE&page=${page}`)
    return this.joinDetailsSeries(movies)
  }
  getGenres() {
    let genresMovies$ = this.http.get(this.API + `genre/movie/list?language=es-VE`) as Observable<any>
    let genresSeries$ = this.http.get(this.API + `genre/tv/list?language=es-VE`) as Observable<any>
    let genres$ = forkJoin([genresMovies$, genresSeries$]).pipe(
      map(([movies, series]) => {
        const all = [...movies.genres, ...series.genres];
        // eliminar duplicados por id
        return all.filter((g, index, self) =>
          index === self.findIndex(t => t.id === g.id)
        );
      })
    );
    genres$.subscribe(res => console.log(res))
    return genres$
  }
  getMoviesByGenre(genre_id:number,page:number){
    const moviesByGenre$=this.http.get(this.API + `discover/movie?language=es-VE&page=${page}&sort_by=popularity.desc&with_genres=${genre_id}`) as Observable<any>
    return this.joinDetailsMovie(moviesByGenre$)
  }
  getSeriesByGenre(genre_id:number,page:number){
    const seriesByGenre$=this.http.get(this.API + `discover/tv?language=es-VE&page=${page}&sort_by=popularity.desc&with_genres=${genre_id}`) as Observable<any>
    return this.joinDetailsSeries(seriesByGenre$)
  }

  /*  getMoreData(MethodApi: Function, currentData: WritableSignal<listMovies | listSeries | undefined>) {
     console.log('solicitando mas datos')
     let currentPage = currentData()?.page
     if (currentPage) currentPage += 1
     console.log('numero de pagina', currentPage)
 
     MethodApi(currentPage).subscribe((newData: any) => {
       currentData.update((data: any) => ({
         ...data,
         page: newData.page,
         results: [...data?.results, ...newData.results]
       }))
     })
   } */

  getMoreData<T extends { page: number; results: any[] }>(
    MethodApi: (...args: any[]) => Observable<T>,
    currentData: WritableSignal<T | undefined>,
    ...extraArgs: any[]
  ) {
    console.log('solicitando mas datos');

    let currentPage = currentData()?.page ?? 0;
    currentPage += 1;

    console.log('numero de pagina', currentPage);

    // 👇 pasamos currentPage + extraArgs
    MethodApi(currentPage, ...extraArgs).subscribe((newData: T) => {
      console.log(newData)
      currentData.update((data) => ({
        ...data,
        page: newData.page,
        results: [...(data?.results ?? []), ...newData.results]
      } as T));
    });
  }


}
