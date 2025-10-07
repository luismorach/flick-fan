import { Component, computed, effect, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/services/API/api.service';
import { createChunks, hasNextPage} from '../shared/utils/helpers';
import { CommonModule, DOCUMENT } from '@angular/common';
import { CardSerieComponent } from '../shared/components/carousel-series/card-serie/card-serie.component';
import { ComunicatorService } from '../core/services/comunicator/comunicator.service';
import { CarouselSkeletonComponent } from '../shared/components/carousel/carousel-skeleton/carousel-skeleton.component';
import { fade } from '../shared/animations/animations';
import { CarouselSeriesSkeletonComponent } from '../shared/components/carousel-series/carousel-series-skeleton/carousel-series-skeleton.component';
import { CardMovieSkeletonComponent } from '../shared/components/carousel/card-movie-skeleton/card-movie-skeleton.component';
import { CardMovieComponent } from '../shared/components/carousel/card-movie/card-movie.component';
import { CardSerieSkeletonComponent } from '../shared/components/carousel-series/card-serie-skeleton/card-serie-skeleton.component';
import { Genre } from '../core/interfaces/shared/genre.interface';
import { MovieList } from '../core/interfaces/movie/movie.interface';
import { SerieList } from '../core/interfaces/serie/serie.interface';
import { HandleCardSeries } from '../shared/utils/handle-card-series';
import { SkeletonSlidesHook, useSkeletonSlides } from '../shared/utils/use-skeleton-slides';

@Component({
  selector: 'app-search',
  imports: [CardMovieComponent, CommonModule, CardSerieComponent, CarouselSkeletonComponent,
    CarouselSeriesSkeletonComponent, CardMovieSkeletonComponent, CardSerieSkeletonComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
  animations: [fade]
})
export default class SearchComponent {
  movies: WritableSignal<MovieList | undefined> = signal(undefined)
  series: WritableSignal<SerieList | undefined> = signal(undefined)
  currentMovies: WritableSignal<MovieList | undefined> = signal(undefined)
  currentSeries: WritableSignal<SerieList | undefined> = signal(undefined)
  genres: WritableSignal<Genre[] | undefined> = signal(undefined)
  moviesLoading: WritableSignal<boolean> = signal(false)
  seriesLoading: WritableSignal<boolean> = signal(false)
  selectedGenreId = 0
  doc = inject(DOCUMENT)
  api = inject(ApiService)
  selectedType = 'all'
  searchQuery = ''
  slides: SkeletonSlidesHook = useSkeletonSlides(288,40);
  chunks = computed(() => {
    const data = this.currentSeries()?.results ?? [];
    return createChunks(data, this.slides.getCurrentSlidesPerView());
  });

  constructor(private activatedRoute: ActivatedRoute, private comunicatorService: ComunicatorService,
    private handleCardSeries:HandleCardSeries) {
    this.comunicatorService.setBackgroundNav(true)
    this.getGenres()
    this.subscribeToRouteChanges()
    effect(() => {
      console.log(this.movies(), this.selectedGenreId)
      this.updateMovies()
      this.moviesLoading.update((value) => !value)
    })
    effect(() => {
      console.log(this.series(), this.selectedGenreId)
      this.updateSeries()
      this.seriesLoading.update((value) => !value)
    })
  }
  subscribeToRouteChanges() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.searchQuery = params.get('wordSearch') || '';
      if (this.searchQuery) {
        this.getMovies();
        this.getSeries()
      }
    });
  }

  getMovies() {
    this.movies.set(undefined)
    let searchedMovies$ = this.api.searchMovie(1, this.searchQuery)
    searchedMovies$.subscribe((movies: MovieList) => {
      console.log(movies)
      document.scrollingElement?.scrollTo(0, 0)
      this.movies.set(movies)
    })
  }

  getSeries() {
    this.series.set(undefined)
    let searchedSeries$ = this.api.searchSerie(1, this.searchQuery)
    searchedSeries$.subscribe((series: SerieList) => {
      console.log(series)
      document.scrollingElement?.scrollTo(0, 0)
      this.series.set(series)
    })
  }
  getGenres() {
    this.api.getGenres().subscribe((genres: any) => this.genres.set(genres))
  }

  filterByGenre(event: Event) {
    const target = event.target as HTMLSelectElement
    this.selectedGenreId = Number(target.value)
    this.updateMovies()
    this.updateSeries()
  }

  filterDataByGenre<T extends MovieList | SerieList | undefined>
    (data: WritableSignal<T>, genre_id: number) {
    if (!data()) return
    const filteredData = data()?.results.filter((data) =>
      data.genres.some(genre => genre.id === genre_id))

    return { ...data(), results: filteredData } as T
  }

  updateMovies() {
    if (this.selectedGenreId === 0) {
      this.currentMovies.set(this.movies())
      return
    }
    const movies = this.filterDataByGenre(this.movies, this.selectedGenreId)
    this.currentMovies.set(movies)

  }
  updateSeries() {
    if (this.selectedGenreId === 0) {
      this.currentSeries.set(this.series())
      return
    }
    const series = this.filterDataByGenre(this.series, this.selectedGenreId)
    this.currentSeries.set(series)

  }

  loadMoreMovies() {
    const canFetchNext = hasNextPage(this.movies());

    if (!canFetchNext) return;

    this.moviesLoading.set(true);
    this.api.getMoreData(this.api.searchMovie.bind(this.api), this.movies, this.searchQuery)
  }

  loadMoreSeries() {
    const canFetchNext = hasNextPage(this.series());

    if (!canFetchNext) return;

    this.seriesLoading.set(true);
    this.api.getMoreData(this.api.searchSerie.bind(this.api), this.series, this.searchQuery)
  }

  get resultsSeries() {
    return this.currentSeries()?.results ?? [];
  }

  get resultsMovies() {
    return this.currentMovies()?.results ?? [];
  }

  handleMouseEnterCardSerie(event: MouseEvent, index: number) {
    this.handleCardSeries.handleCardHover(event, index, this.slides.spaceBetween())
  }

  handleMouseLeaveCardSerie(event: MouseEvent) {
   this.handleCardSeries. resetCardHover(event)
  }
}
