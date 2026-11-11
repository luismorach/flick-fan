import { Component, computed, ElementRef, inject, input, viewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, switchMap } from 'rxjs';
import { Movie } from '../../../core/interfaces/movie/movie.interface';
import { Credits, Crew } from '../../../core/interfaces/people/credits.interface';
import { Serie } from '../../../core/interfaces/serie/serie.interface';
import { ApiService } from '../../../core/services/API/api.service';
import { getHeightContainer } from '../../../shared/utils/helpers';

@Component({
  selector: 'app-about',
  imports: [NgOptimizedImage],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  media = input.required<Movie | Serie | undefined>();
  type = input.required<'movie' | 'serie' | undefined>()
  api = inject(ApiService);

  private readonly sinopsysContainer = viewChild<ElementRef<HTMLElement>>('sinopsysContainer')

  credits = toSignal(
    combineLatest([
      toObservable(this.media),
      toObservable(this.type)
    ]).pipe(
      filter(([media, type]) => !!media?.id && !!type),
      switchMap(([media,type]) => this.api.getCredits<Credits>({ dataId: media?.id, type: type }))
    ),
    { initialValue: undefined }
  );

  director = computed(() => {
    return this.credits()?.crew.find((person: Crew) => person.job === 'Director')
  })
  producer = computed(() => {
    return this.credits()?.crew.find((person: Crew) => person.job === 'Producer')
  })
  production = computed(() => {
    return this.media()?.production_companies[0]
  })
  height = getHeightContainer(this.sinopsysContainer)
}
