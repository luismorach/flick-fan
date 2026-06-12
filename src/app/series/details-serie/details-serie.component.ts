import { NgOptimizedImage, DatePipe, DecimalPipe } from '@angular/common';
import {
  Component, computed, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, inject, Signal, untracked,
  viewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { ApiService } from '../../core/services/API/api.service';
import { SerieList } from '../../core/interfaces/serie/serie.interface';
import { AutoImagePipe } from '../../shared/pipes/autoimage/auto-image.pipe';
import { CarouselService } from '../../core/services/carousel/carousel-service';
import { withPagination } from '../../shared/utils/data-loaders/enhancers/with-pagination';
import { useDataLoader } from '../../shared/utils/data-loaders/use-data-loader';
import { IconComponent } from '../../shared/icon/icon.component';
import { CarouselOptions } from '../../core/interfaces/shared/carousel-interface';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { BackgroundNavScrollDirective } from '../../core/directives/background-nav-scroll.directive';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { getHeightContainer, getReleaseDate } from '../../shared/utils/helpers';
import { DetailsEpisodesComponent } from "../details-episodes/details-episodes.component";
import { MovieList } from '../../core/interfaces/movie/movie.interface';
import { CarouselNavigationComponent } from '../../shared/components/carousel/carousel-navigation/carousel-navigation.component';

@Component({
  selector: 'app-details-serie',
  imports: [NgOptimizedImage, DatePipe, DecimalPipe, AutoImagePipe, IconComponent, CdkScrollable,
    BackgroundNavScrollDirective, DetailsEpisodesComponent, CarouselNavigationComponent],
  providers: [CarouselService],
  templateUrl: './details-serie.component.html',
  styleUrl: './details-serie.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class DetailsSerieComponent {

  private activeRoute = inject(ActivatedRoute)
  private router = inject(Router)
  private api = inject(ApiService)

  private id_serie = toSignal(
    this.activeRoute.params.pipe(
      map(params => params['id_serie'])),
    { initialValue: undefined }
  );

  protected serie = toSignal(
    toObservable(this.id_serie).pipe(
      switchMap(id => this.api.getDetailsSerie({ dataId: id }))),
    { initialValue: undefined }
  );

  protected credits = toSignal(
    toObservable(this.id_serie).pipe(
      switchMap(id => this.api.getCreditsSerie({ dataId: id }))
    ),
    { initialValue: undefined }
  );

  protected recomended: Signal<SerieList | undefined> = toSignal(
    toObservable(this.id_serie).pipe(
      switchMap(id => this.api.getRecomendedSeries({ dataId: id }))
    ),
    { initialValue: undefined }
  );

  readonly recomendedSeriesLoader = useDataLoader<SerieList, 'results'>('results', this.recomended, { dataId: this.id_serie() })
  .with(withPagination)
  .build();
  

  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carouselRecomendedSeries')
  private readonly sinopsysContainer = viewChild<ElementRef<HTMLElement>>('leftPanel')
  private readonly creditsContainer = viewChild<ElementRef<HTMLElement>>('creditsContainer')
  readonly carouselService = inject(CarouselService<MovieList, 'results'>);
  protected height = getHeightContainer(this.sinopsysContainer)


  resetScroll = effect(() => {
    const id = this.id_serie();

    if (!id) return;
    untracked(() => {
      this.carouselService.navigation.resetPosition()
      requestAnimationFrame(() => {
        document.scrollingElement?.scrollTo(0, 0)
        this.creditsContainer()?.nativeElement.scrollTo({ top: 0 })
      })
    })
  })

  readonly carouselOptions: CarouselOptions = {
    requiresEnrichment: false,
    orientation: 'horizontal',
    requireSnapMandatory: true,
    slidesConfig: {
      slidesPerView: 1,
      peek: 32,
      peekSkeletonOffset: 0,
      spaceBetween: 24,
      breakpoints: {
        420: { slidesPerView: 1.5 },
        480: { slidesPerView: 2 },
        640: { slidesPerView: 3 },
        768: { slidesPerView: 4, peek: 96 },
        988: { slidesPerView: 5, peek: 96 }
      }
    }
  }


  constructor() {
    this.carouselService.initialize(this.carouselContainer, this.carouselOptions, this.recomendedSeriesLoader)
  }

  production = computed(() => {
    return this.serie()?.production_companies[0]
  })

  redirect(id: number) {
    this.router.navigate(['/details-serie/', id])
  }

}



