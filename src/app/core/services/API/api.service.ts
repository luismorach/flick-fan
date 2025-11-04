import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, WritableSignal, inject } from '@angular/core';
import { catchError, concatMap, distinct, forkJoin, from, lastValueFrom, map, merge, mergeAll, mergeMap, Observable, of, shareReplay, switchMap, tap, toArray } from 'rxjs';
import { Credits } from '../../interfaces/people/credits.interface';
import { MovieList, Movie } from '../../interfaces/movie/movie.interface';
import { Serie, SerieList } from '../../interfaces/serie/serie.interface';
import { environment } from '../../environment/environment';
import { Genre } from '../../interfaces/shared/genre.interface';
import { PaginatedData } from '../../interfaces/shared/generic.interface';
import { ParamsApi } from '../../interfaces/shared/params-http.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE = environment.tmdb.API_URL;
  private readonly DEFAULT_LANGUAGE = 'es-VE';
  private genresCache$?: Observable<Genre[]>;
  private readonly ENRICHMENT_CONCURRENCY = 4;

  private readonly methodMap: { [key: string]: any } = {
    now_playing: this.getNowPlaying.bind(this),
    upcoming_movies: this.getUpcoming.bind(this),
    popular_movies: this.getPopular.bind(this),
    similar_movies: this.getSimilarMovies.bind(this),
    recomended_movies: this.getRecomendedMovies.bind(this),
    movies_by_genre: this.getMoviesByGenre.bind(this),
    search_movie: this.searchMovie.bind(this),
    popular_series: this.getPopularSeries.bind(this),
    airing_today: this.getAiringTodaySeries.bind(this),
    on_the_air_series: this.getOnTheAirSeries.bind(this),
    similar_series: this.getSimilarSeries.bind(this),
    recomended_series: this.getRecomendedSeries.bind(this),
    series_by_genre: this.getSeriesByGenre.bind(this),
    search_serie: this.searchSerie.bind(this),
  };

  // ==================== MOVIES ====================

  getNowPlaying(params: ParamsApi) {
    return this.getMoviesWithDetails(`movie/now_playing`, params, 'now_playing')
  }

  getPopular(params: ParamsApi) {
    return this.getMoviesWithDetails(`movie/popular`, params, 'popular_movies')
  }

  getUpcoming(params: ParamsApi) {
    return this.getMoviesWithDetails(`movie/upcoming`, params, 'upcoming_movies')
  }

  getDetailsMovie(movieId: number): Observable<Movie> {
    return this.http
      .get<Movie>(`${this.API_BASE}/movie/${movieId}`, {
        params: this.buildParams({ append_to_response: 'videos' })
      })
  }

  getCreditsMovie(movieId: number): Observable<Credits> {
    return this.http
      .get<Credits>(`${this.API_BASE}/movie/${movieId}/credits`, {
        params: this.buildParams(),
      })
  }

  getSimilarMovies(params: ParamsApi) {
    return this.getMoviesWithDetails(`movie/${params.movieId}/similar`, params, 'similar_movies');
  }

  getRecomendedMovies(params: ParamsApi) {
    return this.getMoviesWithDetails(`movie/${params.movieId}/recommendations`, params, 'recomended_movies');
  }

  searchMovie(params: ParamsApi) {
    return this.http
      .get<MovieList>(`${this.API_BASE}/search/movie`, {
        params: this.buildParams(params),
      })
      .pipe(
        switchMap((response) => this.enrichMoviesWithDetails(response, 'search_movie')),
      );
  }

  getMoviesByGenre(query: string, genreId: number, page: number = 1) {
    return this.http
      .get<MovieList>(`${this.API_BASE}/search/movie`, {
        params: this.buildParams({ page, query, with_genres: genreId }),
      }).pipe(
        switchMap((response) => this.enrichMoviesWithDetails(response, 'movies_by_genre')),
      );
    //https://api.themoviedb.org/3/search/movie?api_key=TU_API_KEY&query=superman&with_genres=28&language=es-MX
    /* return this.http
      .get<MovieList>(`${this.API_BASE}/discover/movie`, {
        params: this.buildParams({
          page,
          sort_by: 'popularity.desc',
          with_genres: genreId,
        }),
      })
      .pipe(
        switchMap((response) => this.enrichMoviesWithDetails(response, 'movies_by_genre'))
      ); */
  }

  private getMoviesWithDetails(endpoint: string, params: ParamsApi, type: string): Observable<MovieList> {
    return this.http.get<MovieList>(`${this.API_BASE}/${endpoint}`, {
      params: this.buildParams(params),
    })
      .pipe(
        switchMap((response) => this.enrichMoviesWithDetails(response, type))
      );
  }

  private enrichMoviesWithDetails(movieList: MovieList, type: string): Observable<MovieList> {
    return this.enrichMediaWithDetails(movieList, 'movie', type) as Observable<MovieList>;
  }

  // ==================== SERIES ====================

  getAiringTodaySeries(page: number = 1) {
    return this.getSeriesWithDetails('tv/airing_today', page, 'airing_today');
  }

  getOnTheAirSeries(page: number = 1) {
    return this.getSeriesWithDetails('tv/on_the_air', page, 'on_the_air_series');
  }
  getPopularSeries(page: number) {
    return this.getSeriesWithDetails('tv/popular', page, 'popular_series');
  }

  getDetailsSerie(serieId: number): Observable<Serie> {
    return this.http
      .get<Serie>(`${this.API_BASE}/tv/${serieId}`, {
        params: this.buildParams({ append_to_response: 'videos' }),
      })
      .pipe(
        switchMap((serie) => this.enrichSerieWithSeasons(serie, serieId))
      );
  }

  getCreditsSerie(serieId: number): Observable<Credits> {
    return this.http
      .get<Credits>(`${this.API_BASE}/tv/${serieId}/credits`, {
        params: this.buildParams(),
      })
  }

  getSimilarSeries(page: number, serieId: number) {
    return this.getSeriesWithDetails(`tv/${serieId}/similar`, page, 'similar_series');
  }

  getRecomendedSeries(page: number, serieId: number) {
    return this.getSeriesWithDetails(`tv/${serieId}/recommendations`, page, 'recomended_series');
  }

  searchSerie(params: ParamsApi) {
    return this.http
      .get<SerieList>(`${this.API_BASE}/search/tv`, {
        params: this.buildParams(params),
      })
      .pipe(
        switchMap((response) => this.enrichSeriesWithDetails(response, 'search_serie'))
      );
  }

  getSeriesByGenre(genreId: number, page: number) {
    return this.http
      .get<SerieList>(`${this.API_BASE}/discover/tv`, {
        params: this.buildParams({
          page,
          sort_by: 'popularity.desc',
          with_genres: genreId,
        }),
      })
      .pipe(
        switchMap((response) => this.enrichSeriesWithDetails(response, 'series_by_genre'))
      );
  }

  private getSeriesWithDetails(endpoint: string, page: number, type: string): Observable<SerieList> {
    return this.http
      .get<SerieList>(`${this.API_BASE}/${endpoint}`, {
        params: this.buildParams({ page }),
      })
      .pipe(
        switchMap((response) => this.enrichSeriesWithDetails(response, type))
      );
  }

  private enrichSeriesWithDetails(serieList: SerieList, type: string): Observable<SerieList> {
    return this.enrichMediaWithDetails(serieList, 'tv', type) as Observable<SerieList>;
  }

  private enrichSerieWithSeasons(serie: Serie, serieId: number): Observable<Serie> {
    if (!serie.seasons || serie.seasons.length === 0) {
      return of(serie);
    }

    const seasonRequests = serie.seasons.map((season) =>
      this.http
        .get<any>(`${this.API_BASE}/tv/${serieId}/season/${season.season_number}`, {
          params: this.buildParams(),
        })
    );

    return forkJoin(seasonRequests).pipe(
      map((seasons) => ({
        ...serie,
        seasons,
      }))
    );
  }

  // ==================== GENRES ====================

  getGenres() {
    if (!this.genresCache$) {
      const genresMovies$ = this.http.get<any>(`${this.API_BASE}/genre/movie/list`, {
        params: this.buildParams(),
      });

      const genresSeries$ = this.http.get<any>(`${this.API_BASE}/genre/tv/list`, {
        params: this.buildParams(),
      });

      this.genresCache$ = forkJoin([genresMovies$, genresSeries$]).pipe(
        map(([movies, series]) => {
          const all = [...movies.genres, ...series.genres];
          return all.filter(
            (genre, index, self) => index === self.findIndex((g) => g.id === genre.id)
          );
        }),
        shareReplay(1)
      );
    }

    return this.genresCache$
  }

  async getMoreData<T extends { page: number; results: any[], type: string }>
    (
      currentData: WritableSignal<T | undefined>,
      ...extraArgs: any[]
    ) {
    const currentValue = currentData();
    if (!currentValue) {
      console.error('No hay datos actuales');
      return;
    }

    const apiMethod = this.methodMap[currentValue.type];

    if (!apiMethod) {
      console.error(`Unknown data type: ${currentValue.type}`);
      return;
    }

    const nextPage = (currentValue.page ?? 0) + 1;
    console.log('Loading page:', nextPage, 'for type:', currentValue.type, 'extraargs:', extraArgs);
    const newData: T = await lastValueFrom(apiMethod(nextPage, ...extraArgs));

    console.log(newData)
    currentData.update((data) => ({
      ...data,
      page: newData.page,
      results: [...(data?.results ?? []), ...newData.results]
    } as T));
  }

  async fetchNextPage<T>(params: ParamsApi = {}
  ): Promise<PaginatedData<T>> {

    const type = params.type ?? ''
    const apiMethod = this.methodMap[type];
    const { genreId, movieId, serieId, query } = params;
    if (!apiMethod) throw new Error(`Unknown data type: ${type}`);
    console.log(genreId, movieId, serieId, query)

    console.log('Loading page:', params.page, 'for type:', type, 'extraargs:', params);
    const newData: T = await lastValueFrom(
      apiMethod(params));
    console.log(newData)
    return newData as PaginatedData<T>
  }

  private enrichMediaWithDetails(
    mediaList: MovieList | SerieList,
    mediaType: 'movie' | 'tv',
    type: string
  ): Observable<MovieList | SerieList> {

    if (!mediaList.results || mediaList.results.length === 0) {
      return of({ ...mediaList, type, results: [] });
    }

    return from(mediaList.results).pipe(
      mergeMap(
        (media) => this.http.get<Movie | Serie>(`${this.API_BASE}/${mediaType}/${media.id}`, {
          params: this.buildParams({ append_to_response: 'videos' }),
        }), this.ENRICHMENT_CONCURRENCY
      ),
      toArray(),
      map((enrichedMedia) => ({
        ...mediaList,
        results: enrichedMedia,
        type,
      } as MovieList | SerieList))
    );
  }



  private buildParams(params: Record<string, any> = {}): HttpParams {
    let httpParams = new HttpParams().set('language', this.DEFAULT_LANGUAGE);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return httpParams;
  }

}
