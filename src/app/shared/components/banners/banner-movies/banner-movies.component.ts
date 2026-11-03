import {
  Component, inject, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, ElementRef, input, viewChild, viewChildren,
  effect,
  computed,
  signal,
  untracked
} from '@angular/core';
import { fade } from '../../../animations/animations';
import { BannerSkeletonComponent } from './banner-skeleton/banner-skeleton.component';
import { MovieList } from '../../../../core/interfaces/movie/movie.interface';
import { BannerDetailComponent } from "./banner-movie-details/banner-movie-details.component";
import { FloatTrailerService } from '../../../../core/services/float-trailer/float-trailer.service';
import { CarouselOptions } from '../../../../core/interfaces/shared/carousel-interface';
import { WithDetails } from '../../../utils/data-loaders/enhancers/with-details';
import { useDataLoader } from '../../../utils/data-loaders/use-data-loader';
import { withInfiniteScroll } from '../../../utils/data-loaders/enhancers/with-infinite-scroll';
import { CarouselService } from '../../../../core/services/test/carousel/carousel-service';
import { CarouselNavigationComponent } from '../../carousel/carousel-navigation/test/carousel-navigation.component';
import { useIntersectionObserver } from '../../../utils/use-intersection-observer';

@Component({
  selector: 'app-banner-movies',
  imports: [BannerSkeletonComponent, BannerDetailComponent, CarouselNavigationComponent],
  providers: [CarouselService],
  templateUrl: './banner-movies.component.html',
  styleUrl: './banner-movies.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade],
})

export default class BannerMoviesComponent {
  // Dependencies
  readonly carouselService = inject(CarouselService<MovieList, 'results'>);

  // Inputs
  readonly movieList = input.required<MovieList | undefined>()

  // View Queries
  private readonly carouselContainer = viewChild<ElementRef<HTMLElement>>('carousel')
  private readonly slides = viewChildren<ElementRef<HTMLElement>>('slides')
  private readonly sentinels = viewChildren<ElementRef<HTMLElement>>('sentinels')

  private intersection = useIntersectionObserver()

  readonly loader = useDataLoader<MovieList, 'results'>('results', this.movieList)
    .with(withInfiniteScroll)
    .with(WithDetails)
    .build();

  activeIndex = computed(() => {
    return this.carouselService.state().activeIndex?.() ?? 0
  })
  private carouselOptions: CarouselOptions = {
    requiresEnrichment: true,
    slidesPerGroup: 1,
    orientation: 'horizontal',
    slidesConfig: {}
  }

  init = effect(() => {
    const container = this.carouselContainer()
    if (!container) return
    this.carouselService.initialize(container, this.carouselOptions, this.loader)
    console.log('inicializo',this.carouselService.state().currentElement?.())
    /* this.intersection.initialize(container, this.loader.loadDetails.bind(this.loader)) */
  })

  initInfiniteScroll = effect((onCleanup) => {
    const sentinels = this.sentinels()
    const container = this.carouselContainer()

    if (!this.loader || sentinels.length === 0 || !container) return
    untracked(() => {
      const cleanup = this.loader.setupInfiniteScroll?.(sentinels, container)
      //if (cleanup) onCleanup(cleanup); 
    })
  })

  addElements = effect(() => {
    const elements = this.slides()
    if(!elements) return
    console.log('effect elements',elements)
    const elementsHtml = elements.map(ref => ref.nativeElement);
      this.intersection.observeElements(elementsHtml);
  })

  translate = effect(() => {
    const position = this.carouselService.state().currentPosition?.()
    if (position === undefined) return
    untracked(() => {
      this.carouselService.navigation.translateToCurrentPosition()
    })

  })

  /* constructor() {
    //this.loader.setupInfiniteScroll(this.sentinels, this.carouselContainer)
    this.carouselService.initialize(this.carouselContainer(), this.carouselOptions, this.loader)
  } */
}






