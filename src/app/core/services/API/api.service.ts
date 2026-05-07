import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { forkJoin, from, lastValueFrom, map, mergeMap, Observable, of, shareReplay, switchMap, toArray } from 'rxjs';
import { Credits } from '../../interfaces/people/credits.interface';
import { Movie } from '../../interfaces/movie/movie.interface';
import { Season, Serie } from '../../interfaces/serie/serie.interface';
import { environment } from '../../environment/environment';
import { Genre } from '../../interfaces/shared/genre.interface';
import { ParamsApi } from '../../interfaces/shared/params-http.interface';
/* import { Cacheable } from 'ngx-cacheable'; */
import { toSignal } from '@angular/core/rxjs-interop';
import { Videos } from '../../interfaces/media/videos.interface';
import { MediaItem, MediaList } from '../../interfaces/shared/generic.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE = environment.tmdb.API_URL;
  private readonly DEFAULT_LANGUAGE = 'es-VE';
  private genresCache$?: Observable<Genre[]>;
  public moviesGenres: WritableSignal<Genre[]> = signal([])
  public seriesGenres: WritableSignal<Genre[]> = signal([])
  public allGenres: WritableSignal<Genre[]> = signal([]);
  private readonly ENRICHMENT_CONCURRENCY = 4;

  readonly methodMap: { [key: string]: any } = {
    now_playing_movies: this.getNowPlaying.bind(this),
    upcoming_movies: this.getUpcoming.bind(this),
    popular_movies: this.getPopular.bind(this),
    top_rated_movies: this.getTopRatedMovies.bind(this),
    similar_movies: this.getSimilarMovies.bind(this),
    recomended_movies: this.getRecomendedMovies.bind(this),
    details_movie: this.getDetailsMovie.bind(this),
    movies_by_genre: this.getMoviesByGenre.bind(this),
    search_movies: this.searchMovie.bind(this),

    popular_series: this.getPopularSeries.bind(this),
    airing_today_series: this.getAiringTodaySeries.bind(this),
    on_the_air_series: this.getOnTheAirSeries.bind(this),
    top_rated_series: this.getTopRatedSeries.bind(this),
    similar_series: this.getSimilarSeries.bind(this),
    recomended_series: this.getRecomendedSeries.bind(this),
    details_serie: this.getDetailsSerie.bind(this),
    search_series: this.searchSerie.bind(this),

  };

  // ==================== MOVIES ====================

  /* @Cacheable() */
  getNowPlaying(params: ParamsApi) {
    const endpoint = `movie/now_playing`
    const type = 'now_playing_movies'
    return this.getMediaDetails<Movie>(endpoint, params, type)
  }

  /* @Cacheable() */
  getPopular(params: ParamsApi) {
    const endpoint = `movie/popular`
    const type = 'popular_movies'
    return this.getMediaDetails<Movie>(endpoint, params, type)
  }

  getUpcoming(params: ParamsApi) {
    const endpoint = `movie/upcoming`
    const type = 'upcoming_movies'
    return this.getMediaDetails<Movie>(endpoint, params, type)
  }

  /*  @Cacheable() */
  getTopRatedMovies(params: ParamsApi) {
    const endpoint = `movie/top_rated`
    const type = 'top_rated_movies'
    return this.getMediaDetails<Movie>(endpoint, params, type)
  }
  /* @Cacheable() */
  getDetailsMovie(params: ParamsApi): Observable<Movie> {
    return this.http
      .get<Movie>(`${this.API_BASE}/movie/${params.dataId}`, {
        params: this.buildParams({ append_to_response: 'videos,release_dates' })
      })
  }

  getMovieVideos(params: ParamsApi) {
    console.log('🚀 getMovieVideos llamado para ID:', params.dataId);
    return this.http
      .get<Videos>(`${this.API_BASE}/movie/${params.dataId}/videos`, {
        params: this.buildParams()
      })
  }

  getCreditsMovie(params: ParamsApi): Observable<Credits> {
    return this.http
      .get<Credits>(`${this.API_BASE}/movie/${params.dataId}/credits`, {
        params: this.buildParams(),
      })
  }

  getMediaDetails<T extends MediaItem>(endpoint: string, params: ParamsApi, type: string) {
    return this.http.get<MediaList<T>>(`${this.API_BASE}/${endpoint}`, {
      params: this.buildParams(params),
    }).pipe(map((list) => ({
      ...list,
      type: type,
      results: list.results.map(data => ({
        ...data,
        genres: this.mapGenreIdsToGenres(data.genre_ids)
      }))
    })))
  }

  private mapGenreIdsToGenres(genreIds: number[] = [], allGenres: Genre[] = this.allGenres() ?? []): Genre[] {
    const map = new Map(allGenres.map(g => [g.id, g]));
    return genreIds.map(id => map.get(id)!).filter(Boolean);
  }

  getSimilarMovies(params: ParamsApi) {
    const endpoint = `movie/${params.dataId}/similar`
    const type = 'upcoming_movies'
    return this.getMediaDetails<Movie>(endpoint, params, type)
  }

  getRecomendedMovies(params: ParamsApi) {
    const endpoint = `movie/${params.dataId}/recommendations`
    const type = 'recomended_movies'
    return this.getMediaDetails<Movie>(endpoint, params, type)
  }

  searchMovie(params: ParamsApi) {
    const endpoint = `/search/movie`
    const type = 'search_movies'
    return this.getMediaDetails<Movie>(endpoint, params, type)
  }

  getMoviesByGenre(params: ParamsApi) {
    return this.http
      .get<Movie>(`${this.API_BASE}/search/movie`, {
        params: this.buildParams(params),
      })
    //https://api.themoviedb.org/3/search/movie?api_key=TU_API_KEY&query=superman&with_genres=28&language=es-MX
    /* return this.http
      .get<Movie>(`${this.API_BASE}/discover/movie`, {
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


  // ==================== SERIES ====================

  /* @Cacheable() */
  getAiringTodaySeries(params: ParamsApi) {
    const type = 'airing_today_series'
    return this.getMediaDetails<Serie>('tv/airing_today', params, type)
  }

  /* @Cacheable() */
  getOnTheAirSeries(params: ParamsApi) {
    const type = 'on_the_air_series'
    return this.getMediaDetails<Serie>('tv/on_the_air', params, type)
  }
  /*  @Cacheable() */
  getPopularSeries(params: ParamsApi) {
    const type = 'popular_series'
    return this.getMediaDetails<Serie>('tv/popular', params, type)
  }

  /*  @Cacheable() */
  getTopRatedSeries(params: ParamsApi) {
    const endpoint = 'tv/top_rated'
    const type = 'top_rated_series'
    return this.getMediaDetails<Serie>(endpoint, params, type)
  }

  getDetailsSerie(params: ParamsApi): Observable<Serie> {
    return this.http
      .get<Serie>(`${this.API_BASE}/tv/${params.dataId}`, {
        params: this.buildParams({ append_to_response: 'videos,external_ids,release_dates' }),
      })
  }

  getCreditsSerie(params: ParamsApi): Observable<Credits> {
    return this.http
      .get<Credits>(`${this.API_BASE}/tv/${params.dataId}/credits`, {
        params: this.buildParams(),
      })
  }

  getSimilarSeries(params: ParamsApi) {
    const endpoint = `tv/${params.dataId}/similar`
    const type = 'similar_series'
    return this.getMediaDetails<Serie>(endpoint, params, type);
  }

  getRecomendedSeries(params: ParamsApi) {
    const endpoint = `tv/${params.dataId}/recommendations`
    const type = 'recomended_series'
    return this.getMediaDetails<Serie>(endpoint, params, type)
  }

  searchSerie(params: ParamsApi) {
    const endpoint = `search/tv`
    const type = 'search_series'
    return this.getMediaDetails<Serie>(endpoint, params, type)
  }

  getSeason(params: ParamsApi, season_number: number) {
    const endpoint = `${this.API_BASE}/tv/${params.dataId}/season/${season_number}`
    return this.http.get<Season>(endpoint, {
      params: this.buildParams(),
    })
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
          this.moviesGenres.set(movies.genres)
          this.seriesGenres.set(series.genres)
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
  ): Promise<T> {

    const type = params.type ?? ''
    const apiMethod = this.methodMap[type];
    if (!apiMethod) throw new Error(`Unknown data type: ${type}`);

    console.log('Loading page:', params.page, 'for type:', type, 'extraargs:', params);
    const newData: T = await lastValueFrom(
      apiMethod(params));
    console.log(newData)
    return newData as T
  }

  async getDetails<T>(params: ParamsApi) {
    const type = params.type
    if (!type) return
    (type.includes('movies')) ? params.type = 'details_movie' : params.type = 'details_serie'
    const apiMethod = this.methodMap[params.type];
    if (!apiMethod) throw new Error(`Unknown data type: ${type}`);

    console.log('Loading details:', params.page, 'for type:', params.type, 'extraargs:', params);
    const details: T = await lastValueFrom(
      apiMethod(params));
    return details as T
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
