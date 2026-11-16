import { DatePipe, DecimalPipe, DOCUMENT, NgOptimizedImage, UpperCasePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChild, WritableSignal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, map, switchMap, of, tap, filter } from 'rxjs';
import { MovieList, Movie } from '../../core/interfaces/movie/movie.interface';
import { ApiService } from '../../core/services/API/api.service';
import { Season, Serie } from '../../core/interfaces/serie/serie.interface';
import { UrlSafePipe } from '../../shared/pipes/url-safe/url-safe.pipe';
import { IconComponent } from '../../shared/icon/icon.component';
import { getComputedTitle, getComputedTitleImageUrl, isMovie } from '../../shared/utils/helpers';
import { MinutesToTimePipe } from '../../shared/pipes/minutes-to-time/minutes-to-time.pipe';
import { CustomSelectComponent } from '../../shared/components/customs-elements/custom-select/custom-select.component';

@Component({
  selector: 'app-watch',
  imports: [UrlSafePipe, IconComponent, NgOptimizedImage, MinutesToTimePipe, DatePipe, DecimalPipe,
    CustomSelectComponent, RouterLink, UpperCasePipe],
  templateUrl: './watch.component.html',
  styleUrl: './watch.component.css'
})
export default class WatchComponent {

  private route = inject(ActivatedRoute)
  private api = inject(ApiService)
  card = viewChild<ElementRef<HTMLElement>>('card')
  backdrop = viewChild<ElementRef<HTMLElement>>('backdrop')
  test: { name: string, id: number } = { name: 'name', id: 0 }

  isMovie = isMovie
  selectedSeason: WritableSignal<Season | undefined> = signal(undefined)


  protected type = toSignal(this.route.params.pipe(
    map(params => params['type'] as 'movie' | 'serie'),
  ));

  protected id = toSignal(this.route.params.pipe(
    map(params => params['id'] as number)),
    { initialValue: undefined }
  );

  seasonNumber = toSignal(this.route.params.pipe(
    map(params => params['season_number'] as number)),
    { initialValue: 0 }
  );

  episodeNumber = toSignal(this.route.params.pipe(
    map(params => params['episode_number'] as number)),
    { initialValue: 0 }
  );

  media = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => this.api.getDetails<Movie | Serie>({ dataId: id, type: this.type() })),
      tap((data) => {
        if (!isMovie(data)) this.selectedSeason.set(data?.seasons[this.seasonNumber()])
      })),
    { initialValue: undefined }
  );

  title = getComputedTitle(this.media)

  titleImage = getComputedTitleImageUrl(this.media)

  seasonParams = computed(() => ({
    id: this.media()?.id,
    season: this.selectedSeason()
  }));

  season = toSignal(
    toObservable(this.seasonParams).pipe(
      filter(({ id, season }) => !!id && !!season),
      switchMap(({ id, season }) => this.api.getSeason({ dataId: id }, season?.season_number ?? 1)),
    ),
    { initialValue: undefined }
  );

  url_media = computed(() => {
    const type = this.type()
    const id = this.id()
    if (!type || !id) return ''
    if (type === 'movie') return `https://vidsrc.to/embed/movie/${id}`
    return `https://vidsrc.to/embed/tv/${id}/${this.seasonNumber()}/${this.episodeNumber()}`

  })

  move(value: string, event: Event) {

    const el = this.card()?.nativeElement
    const backdrop = this.backdrop()?.nativeElement
    if (!el || !backdrop) return


    const index = value === '0%' ? '30' : '0'
    console.log('el valor es ', value, backdrop, index)

    el.style.transform = ` translateX(${value})`
    backdrop.style.zIndex = index
  }

  redirect() {

  }
  constructor() {
  }
}
