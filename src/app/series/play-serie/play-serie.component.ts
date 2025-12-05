import {
  AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, Renderer2, signal,
  ViewChild, WritableSignal
} from '@angular/core';
import { ActivatedRoute, ParamMap, Params, RouterLink, } from '@angular/router';
import { UrlSafePipe } from '../../shared/pipes/url-safe/url-safe.pipe';
import { combineLatest, concatAll, map, Subscription } from 'rxjs';
import { ApiService } from '../../core/services/API/api.service';
import { DatePipe, DOCUMENT, NgOptimizedImage, } from '@angular/common';
import { ComunicatorService } from '../../core/services/comunicator/comunicator.service';
import { fade } from '../../shared/animations/animations';
import { register, SwiperContainer } from 'swiper/element/bundle';
import { CarouselSeriesComponent } from '../../shared/components/carousel/carousel-series/carousel-series.component';
import { Serie, SerieList, Episode, Season } from '../../core/interfaces/serie/serie.interface';
import { AutoImagePipe } from '../../shared/pipes/autoimage/auto-image.pipe';
register()
@Component({
  selector: 'app-play-serie',
  imports: [UrlSafePipe, NgOptimizedImage, CarouselSeriesComponent, DatePipe,
    RouterLink,AutoImagePipe],
  templateUrl: './play-serie.component.html',
  styleUrl: './play-serie.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [fade],
})

export default class PlaySerieComponent implements AfterViewInit {
  serie: WritableSignal<Serie | undefined> = signal(undefined)
  url_serie = signal('https://vidsrc.to/embed/tv/')
  similarSeries: WritableSignal<SerieList | undefined> = signal(undefined)
  recomendedSeries: WritableSignal<SerieList | undefined> = signal(undefined)
  @ViewChild('swiperSeason') swiperSeasons!: ElementRef<SwiperContainer>
  @ViewChild('swiperEpisodes') swiperEpisodes!: ElementRef<SwiperContainer>
  subscription: Subscription[] = []
  doc = inject(DOCUMENT)
  season_number = -1
  episode_number = -1
  id_serie = 0
  episode!: Episode
  season!: Season

  constructor(private rutaActiva: ActivatedRoute, public API: ApiService,
    private comunicatorService: ComunicatorService, private renderer: Renderer2) {

    this.comunicatorService.setBackgroundNav(true)
    this.getUrlSerie()
    this.getSimilarSeries()
    this.getRecomendedSeries()
  }

  ngAfterViewInit() {
    const swiperEl = document.querySelector('swiper-container');
    console.log(swiperEl?.swiper.navigation.nextEl)
    const button_next = swiperEl?.swiper.navigation.nextEl
    const button_prev = swiperEl?.swiper.navigation.prevEl
    this.renderer.setStyle(button_next, 'opacity', '0')
    this.renderer.setStyle(button_prev, 'opacity', '0')

  }

  swiperInit(event: any) {
    setTimeout(() => {
      console.log('iniciado', event.detail[0].navigation.nextEl)
      const button_next = event.detail[0].navigation.nextEl
      const button_prev = event.detail[0].navigation.prevEl
      this.renderer.setStyle(button_next, 'opacity', '0')
      this.renderer.setStyle(button_prev, 'opacity', '0')
    })
  }

  swiperSlide(event: any) {
    this.onSlideMouse(event, 1)
  }

  onSlideMouse(event: any, opacity: number) {
    const isBeginning = event.target.swiper.isBeginning
    const isEnd = event.target.swiper.isEnd
    console.log(isBeginning)
    const button_next = event.target.swiper.navigation.nextEl
    const button_prev = event.target.swiper.navigation.prevEl;

    (isBeginning) ? this.renderer.setStyle(button_prev, 'opacity', 0) :
      this.renderer.setStyle(button_prev, 'opacity', opacity);

    (isEnd) ? this.renderer.setStyle(button_next, 'opacity', 0) :
      this.renderer.setStyle(button_next, 'opacity', opacity)
  }

  getUrlSerie() {

    let params = combineLatest([this.rutaActiva.paramMap, this.rutaActiva.queryParamMap])
    this.subscription.push(params.pipe(
      map(([params, queryParams]) => {
        this.setUrlSerie(params, queryParams)
        return this.API.getDetailsSerie({dataId:this.id_serie})
      }), concatAll())
      .subscribe((detailSerie: Serie) => {
        console.log('detailserie', detailSerie)
        this.serie.set(detailSerie)
        this.doc.scrollingElement?.scrollTo(0, 0)
        this.setSerie(detailSerie)
      }))
  }

  setUrlSerie(params: ParamMap, queryParams: ParamMap) {
    console.log(params)
    this.id_serie = Number(params.get('id_serie'))
    const hasQuery = queryParams.keys.length > 0;
    if (hasQuery) {
      this.season_number = Number(queryParams.get('number_season'))
      this.episode_number = Number(queryParams.get('number_episode'))
      this.url_serie.set(`https://vidsrc.to/embed/tv/${this.id_serie}/${this.season_number}/${this.episode_number}`)
    } else {
      this.url_serie.set(`https://vidsrc.to/embed/tv/${this.id_serie}`)
    }
  }

  setSerie(detailSerie: Serie) {
    let remainingToIndex= 1
    this.serie.set(detailSerie)
    if (this.season_number === -1) {
      this.season_number = this.getSeasonNumber(this.serie()?.seasons)
      this.episode_number = 1
    }
    if(this.HasEspecial(this.serie()?.seasons)){
      remainingToIndex=0
    }
    this.season = detailSerie.seasons[(this.season_number - remainingToIndex)]
    this.episode = detailSerie.seasons[(this.season_number - remainingToIndex)].episodes[(this.episode_number - 1)]
  }

  getSeasonNumber(seasons: Season[] | undefined) {
    if (seasons === undefined) return 0;
    const season = seasons.find((element: any) => element.name === 'Temporada 1');
    return season?.season_number || 0 ;
  }

  HasEspecial(seasons: Season[] | undefined) {
    if (seasons === undefined) return false;
    const season = seasons.find((element: any) => element.name === 'Especiales');
    return (season) ? true : false;
  }


  getSimilarSeries() {
    this.subscription.push(this.rutaActiva.params.pipe(
      map((params: Params) => this.API.getSimilarSeries({page:1, dataId:params['id_serie']})), concatAll())
      .subscribe((series: any) => {
        if (series.results.length > 0) {
          this.similarSeries.set(series)
        }
      }))
  }

  getRecomendedSeries() {
    this.subscription.push(this.rutaActiva.params.pipe(
      map((params: Params) => this.API.getRecomendedSeries({page:1, dataId:params['id_serie']})), concatAll())
      .subscribe((series: any) => {
        if (series.results.length > 0) {
          this.recomendedSeries.set(series)
        }
      }))
  }

  ngOndestroy() {
    console.log('destroing')
    this.subscription.forEach(subscription => {
      subscription.unsubscribe()
    })
  }
}
