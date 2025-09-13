import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../shared/services/API/api.service';
import { genre, listMovies, listSeries } from '../shared/interfaces/interfaces';
import { calculateNumSlides, startTimeOut } from '../shared/utils/helpers';
import { CommonModule, DOCUMENT } from '@angular/common';
import { CardSerieComponent } from '../shared/components/carousel-series/card-serie/card-serie.component';
import { ComunicatorService } from '../shared/services/comunicator/comunicator.service';
import { CarouselSkeletonComponent } from '../shared/components/carousel/carousel-skeleton/carousel-skeleton.component';
import { fade } from '../shared/animations/animations';
import { CarouselSeriesSkeletonComponent } from '../shared/components/carousel-series/carousel-series-skeleton/carousel-series-skeleton.component';
import { CardMovieSkeletonComponent } from '../shared/components/carousel/card-movie-skeleton/card-movie-skeleton.component';
import { CardMovieComponent } from '../shared/components/carousel/card-movie/card-movie.component';
import { CardSerieSkeletonComponent } from '../shared/components/carousel-series/card-serie-skeleton/card-serie-skeleton.component';

@Component({
  selector: 'app-search',
  imports: [CardMovieComponent, CommonModule, CardSerieComponent, CarouselSkeletonComponent,
    CarouselSeriesSkeletonComponent, CardMovieSkeletonComponent, CardSerieSkeletonComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
  animations: [fade]
})
export default class SearchComponent {
  movies: WritableSignal<listMovies | undefined> = signal(undefined)
  series: WritableSignal<listSeries | undefined> = signal(undefined)
  currentMovies: WritableSignal<listMovies | undefined> = signal(undefined)
  currentSeries: WritableSignal<listSeries | undefined> = signal(undefined)
  genres: WritableSignal<genre[] | undefined> = signal(undefined)
  isLoadingMovies: WritableSignal<boolean> = signal(false)
  isLoadingSeries: WritableSignal<boolean> = signal(false)
  listElements: number[] = []
  numElements = 0
  currentGenreID = 0
  doc = inject(DOCUMENT)
  API = inject(ApiService)
  spaceBetween = 42
  selectedType = '0'
  wordSearch = ''

  constructor(private activatedRoute: ActivatedRoute, private comunicatorService: ComunicatorService) {
    this.comunicatorService.setBackgroundNav(true)
    this.getGenres()
    this.subscribeToRouteChanges()
    effect(() => {
      console.log(this.movies(), this.currentGenreID)
      this.updateMovies()
      this.isLoadingMovies.update((value) => !value)
    })
    effect(() => {
      console.log(this.series(), this.currentGenreID)
      this.updateSeries()
      this.isLoadingSeries.update((value) => !value)
    })
  }
  subscribeToRouteChanges() {
    // Es5cucha cambios en la ruta: /search/:name
    
    this.activatedRoute.paramMap.subscribe(params => {
      this.wordSearch = params.get('wordSearch') || '';
      if (this.wordSearch) {
        this.getMovies();
        this.getSeries()
      }
    });
  }

  ngAfterViewInit() {
    this.numElements = calculateNumSlides(this.doc.scrollingElement?.scrollWidth ?? 0, 336)
    this.listElements = Array.from({ length: this.numElements }, (_, i) => i)
  }

  getMovies() {
    this.movies.set(undefined)
    let searchedMovies$ = this.API.searchMovie(1, this.wordSearch)
    searchedMovies$.subscribe((movies: listMovies) => {
      console.log(movies)
      document.scrollingElement?.scrollTo(0, 0)
      this.movies.set(movies)
    })
  }

  getSeries() {
    this.series.set(undefined)
    let searchedSeries$ = this.API.searchSerie(1, this.wordSearch)
    searchedSeries$.subscribe((series: listSeries) => {
      console.log(series)
      document.scrollingElement?.scrollTo(0, 0)
      this.series.set(series)
    })
  }
  getGenres() {
    this.API.getGenres().subscribe((genres: any) => this.genres.set(genres))
  }

  filterByGenre(event: Event) {
    const target = event.target as HTMLSelectElement
    this.currentGenreID = Number(target.value)
    this.updateMovies()
    this.updateSeries()
  }

  getDataByGenre<T extends listMovies | listSeries | undefined>
    (data: WritableSignal<T>, genre_id: number) {
    if (!data()) return
    const filteredData = data()?.results.filter((data) =>
      data.genres.some(genre => genre.id === genre_id))

    return { ...data(), results: filteredData } as T
  }

  updateMovies() {
    if (this.currentGenreID === 0) {
      this.currentMovies.set(this.movies())
      return
    }
    const movies = this.getDataByGenre(this.movies, this.currentGenreID)
    this.currentMovies.set(movies)

  }
  updateSeries() {
    if (this.currentGenreID === 0) {
      this.currentSeries.set(this.series())
      return
    }
    const series = this.getDataByGenre(this.series, this.currentGenreID)
    this.currentSeries.set(series)

  }

  loadMoreMovies() {
    let page = this.movies()?.page ?? 0;
    let total_pages = this.movies()?.total_pages ?? 0;
    if (page >= total_pages) {
      this.isLoadingMovies.set(false)
      return
    }
    this.isLoadingMovies.set(true)
    this.API.getMoreData(this.API.searchMovie.bind(this.API), this.movies, this.wordSearch)
  }
  loadMoreSeries() {
    let page = this.series()?.page ?? 0;
    let total_pages = this.series()?.total_pages ?? 0;
    if (page >= total_pages) {
      this.isLoadingSeries.set(false)
      return
    }
    this.isLoadingSeries.set(true)
    this.API.getMoreData(this.API.searchSerie.bind(this.API), this.series, this.wordSearch)
  }

  get resultsSeries() {
    return this.currentSeries()?.results ?? [];
  }

  get resultsMovies() {
    return this.currentMovies()?.results ?? [];
  }

  mouseEnter(event: any, index: number) {
    const child = event.target as HTMLElement;
    const parent = child.parentElement as HTMLElement;

    //parent.style.width =  (this.doc.scrollingElement?.scrollWidth ?? 0)+806 + 'px'
    console.log('entro', child.offsetLeft, child.offsetWidth, parent.clientWidth, child, index)
    startTimeOut(() => {
      if (index > 1)
        parent.scrollLeft = (child.offsetLeft + Math.floor(child.offsetWidth * 2.8)) -
          parent.clientWidth - this.spaceBetween
    }, 300)

    console.log(parent)
  }

  mouseLeave(event: any) {
    const child = event.target as HTMLElement;
    const parent = child.parentElement as HTMLElement;
    parent.scrollLeft = 0
  }
}
