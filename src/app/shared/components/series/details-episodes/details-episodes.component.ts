import { Component, computed, effect, ElementRef, inject, input, signal, untracked, viewChild, WritableSignal } from '@angular/core';
import { CustomSelectComponent } from "../../customs-elements/custom-select/custom-select.component";
import { Episode, Season, Serie } from '../../../../core/interfaces/serie/serie.interface';
import { CarouselOptions } from '../../../../core/interfaces/shared/carousel-interface';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap, tap } from 'rxjs';
import { ApiService } from '../../../../core/services/API/api.service';
import { NgOptimizedImage } from '@angular/common';
import { IconComponent } from '../../../icon/icon.component';
import { MinutesToTimePipe } from '../../../pipes/minutes-to-time/minutes-to-time.pipe';
import { useDataLoader } from '../../../utils/data-loaders/use-data-loader';
import { CarouselComponent } from '../../carousel/carousel.component';
import { Router } from '@angular/router';

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
  imports: [CustomSelectComponent, NgOptimizedImage, IconComponent, MinutesToTimePipe, CarouselComponent],
  templateUrl: './details-episodes.component.html',
  styleUrl: './details-episodes.component.css'
})

export class DetailsEpisodesComponent {

  readonly serie = input.required<Serie | undefined>()
  private api = inject(ApiService)
  selectedSeason: WritableSignal<Season | undefined> = signal(undefined)
  carousel = viewChild(CarouselComponent)
  private router = inject(Router);

  seasonParams = computed(() => ({
    id: this.serie()?.id,
    season: this.selectedSeason()
  }));

  season = toSignal(
    toObservable(this.seasonParams).pipe(
      filter(({ id, season }) => !!id && !!season),
      switchMap(({ id, season }) => this.api.getSeason({ dataId: id }, season?.season_number ?? 1)),
    ),
    { initialValue: undefined }
  );

  changeSerie = effect(() => {
    const serie = this.serie()
    if (!serie) return
    this.selectedSeason.set(serie.seasons[0])
  })

  changeSeason = effect(() => {
    this.season()
    untracked(() => {
      const carouselService = this.carousel()?.carouselService
      if (!carouselService) return
      carouselService.navigation.resetPosition()
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
        480: { slidesPerView: 1.5 },
        640: { slidesPerView: 2 },
        768: { slidesPerView: 2, peek: 96 },
        988: { slidesPerView: 3, peek: 96 }
      }
    }
  }

  redirectToWatch(episode: Episode) {
    this.router.navigate(['/watch/serie/', episode.show_id, episode.season_number, episode.episode_number])
  }

  readonly loaderEpisodes = useDataLoader<Season, 'episodes'>('episodes', this.season).build();

}
