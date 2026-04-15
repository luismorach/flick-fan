import { Component, computed, effect, ElementRef, inject, input, signal, untracked, viewChild, WritableSignal } from '@angular/core';
import { CustomSelectComponent } from "../../shared/components/elements/custom-select/custom-select.component";
import { Season, Serie } from '../../core/interfaces/serie/serie.interface';
import { CarouselOptions } from '../../core/interfaces/shared/carousel-interface';
import { CarouselService } from '../../core/services/carousel/carousel-service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { ApiService } from '../../core/services/API/api.service';
import { NgOptimizedImage } from '@angular/common';
import { AutoImagePipe } from '../../shared/pipes/autoimage/auto-image.pipe';
import { IconComponent } from '../../shared/icon/icon.component';
import { MinutesToTimePipe } from '../../shared/pipes/minutes-to-time/minutes-to-time.pipe';
import { useDataLoader } from '../../shared/utils/data-loaders/use-data-loader';
import { CarouselNavigationComponent } from "../../shared/components/carousel/carousel-navigation/carousel-navigation.component";

const defaultSeason: Season = {
  air_date: new Date(),
  id: -1,
  name: '',
  overview: '',
  poster_path: '',
  season_number: 0,
  vote_average: 0,
  episode_count: 0,
  episodes: []
}

@Component({
  selector: 'app-details-episodes',
  imports: [CustomSelectComponent, NgOptimizedImage, AutoImagePipe, IconComponent, MinutesToTimePipe, CarouselNavigationComponent],
  providers: [CarouselService],
  templateUrl: './details-episodes.component.html',
  styleUrl: './details-episodes.component.css'
})

export class DetailsEpisodesComponent {

  readonly serie = input.required<Serie | undefined>()
  readonly carousel = inject(CarouselService<Season, 'episodes'>);
  private api = inject(ApiService)
  private readonly carouselEpisodesContainer = viewChild<ElementRef<HTMLElement>>('carouselEpisodes')
  selectedSeason: WritableSignal<Season> = signal(defaultSeason)

  changeSerie = effect(() => {
    const serie = this.serie()
    if (!serie) return
    this.selectedSeason.set(serie.seasons[0])
  })

  changeSelectedSeason = effect(() => {
    this.selectedSeason()
    untracked(() => {
      this.carousel.navigation.resetPosition()

    })
  })


  seasonParams = computed(() => ({
    id: this.serie()?.id,
    season: this.selectedSeason()
  }));

  season = toSignal(
    toObservable(this.seasonParams).pipe(
      filter(({ id, season }) => !!id && !!season),
      switchMap(({ id, season }) =>
        this.api.getSeason({ dataId: id }, season.season_number)
      )
    ),
    { initialValue: undefined }
  );

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
        480: { slidesPerView: 1.5 },
        640: { slidesPerView: 2 },
        768: { slidesPerView: 2, peek: 96 },
        988: { slidesPerView: 3, peek: 96 }
      }
    }
  }

  readonly loaderEpisodes = useDataLoader<Season, 'episodes'>('episodes', this.season)

  constructor() {
    this.carousel.initialize(this.carouselEpisodesContainer, this.carouselOptions, this.loaderEpisodes)
  }

}
