import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, signal, ViewChild, WritableSignal } from '@angular/core';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { map, concatAll } from 'rxjs';
import { register, SwiperContainer } from 'swiper/element/bundle';
import { Credits, season, Serie } from '../../interfaces/interfaces';
import { ApiService } from '../../services/API/api.service';
import { ComunicatorService } from '../../services/comunicator/comunicator.service';
import { CommonModule, DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { getRange } from '../../utils/carousel';
import { FormsModule } from '@angular/forms';

register()
@Component({
  selector: 'app-details-serie',
  imports: [RouterLink, NgOptimizedImage, DecimalPipe, DatePipe,FormsModule,CommonModule],
  templateUrl: './details-serie.component.html',
  styleUrl: './details-serie.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class DetailsSerieComponent implements AfterViewInit {
  serie: WritableSignal<Serie | undefined> = signal(undefined)
  credits: WritableSignal<Credits | undefined> = signal(undefined)
  @ViewChild('swiper', { static: false }) swiperContainer!: ElementRef<SwiperContainer>
  selected_season: number=0

  constructor(private rutaActiva: ActivatedRoute, private API: ApiService,
    private comunicatorService: ComunicatorService) {
    this.comunicatorService.setBackgroundNav(true)
    this.getDetailsserie()
    /* this.getCreditsserie() */
  }
  ngAfterViewInit(): void {

  }

  getRange(value: number | undefined) {
    const range  = value ?? 0
    return getRange(range)
  }
  change(){
    console.log(this.serie()?.seasons[this.selected_season])
  }
  getSeason(){
    return this.serie()?.seasons[this.selected_season]
  }

  getDetailsserie() {
    let detailsserie$ = this.rutaActiva.params.pipe(
      map((params: Params) => this.API.getDetailsSerie(params['id_serie'])), concatAll())

    detailsserie$.subscribe((serie: Serie) => {
      document.scrollingElement?.scrollTo(0, 0)
      this.serie.set(serie)
    })
  }

  getCreditsserie() {
    /* let creditsserie$ = this.rutaActiva.params.pipe(
      map((params: Params) => this.API.getCreditsserie(params['id_serie'])), concatAll())
    creditsserie$.subscribe((credits: Credits) => this.credits.set(credits)) */

  }

  //
  //
  //
  //

  isLiked = false;
  isBookmarked = false;
  selectedSeason = 1;
  
  seriesData: any = {
    title: "The Crown",
    originalTitle: "The Crown",
    year: "2016-2023",
    rating: 8.7,
    genres: ["Drama", "Historia", "Biografía"],
    duration: "58 min",
    seasons: 6,
    episodes: 60,
    status: "Finalizada",
    creator: "Peter Morgan",
    cast: ["Claire Foy", "Olivia Colman", "Imelda Staunton", "Matt Smith"],
    description: "Sigue la vida política rivalries y el romance de la reina Isabel II y los eventos que dieron forma a la segunda mitad del siglo XX. Una mirada íntima a dos de las décadas más conocidas en la historia de la familia real: los años 80 y 90.",
    poster: "https://images.unsplash.com/photo-1489599478069-7af5da8f4de5?w=400&h=600&fit=crop",
    backdrop: `http://image.tmdb.org/t/p/original`,
    trailer: "Disponible",
    awards: ["Emmy", "Golden Globe", "BAFTA"],
    seasons_data: [
      { number: 1, episodes: 10, year: "2016", description: "Los primeros años del reinado de Isabel II" },
      { number: 2, episodes: 10, year: "2017", description: "Crisis del Canal de Suez y escándalos familiares" },
      { number: 3, episodes: 10, year: "2019", description: "Los turbulentos años 60 y 70" },
      { number: 4, episodes: 10, year: "2020", description: "La era de Margaret Thatcher" },
      { number: 5, episodes: 10, year: "2022", description: "Los años 90 y la muerte de Diana" },
      { number: 6, episodes: 10, year: "2023", description: "Los últimos años cubiertos por la serie" }
    ]
  };

  getBackgroundImage(): string {
    console.log(this.seriesData.backdrop + this.serie()?.backdrop_path)
    return `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${this.seriesData.backdrop+this.serie()?.backdrop_path})`;
  }

  toggleLike(): void {
    this.isLiked = !this.isLiked;
  }

  toggleBookmark(): void {
    this.isBookmarked = !this.isBookmarked;
  }

  selectSeason(seasonNumber: number): void {
    this.selectedSeason = seasonNumber;
  }

  getLikeButtonClass(): string {
    return `p-3 rounded-full border-2 transition-all transform hover:scale-110 ${
      this.isLiked 
        ? 'bg-red-500 border-red-500 text-white' 
        : 'border-white/30 text-white hover:border-red-500 hover:text-red-500'
    }`;
  }

  getBookmarkButtonClass(): string {
    return `p-3 rounded-full border-2 transition-all transform hover:scale-110 ${
      this.isBookmarked 
        ? 'bg-red-500 border-red-500 text-white' 
        : 'border-white/30 text-white hover:border-red-500 hover:text-red-500'
    }`;
  }

  getSeasonButtonClass(seasonNumber: number): string {
    return `p-4 rounded-xl text-left transition-all transform hover:scale-105 ${
      this.selectedSeason === seasonNumber
        ? 'bg-red-600 text-white shadow-lg'
        : 'bg-black/30 text-red-100 hover:bg-red-900/30'
    }`;
  }

  getSelectedSeason(): season | undefined{
    const season = this.serie()?.seasons.find((season:any) => season.season_number === this.selectedSeason);
    console.log(season)
    return season;
  }
}



