import { Component, computed, ElementRef, inject, input, viewChild } from '@angular/core';
import { Serie } from '../../core/interfaces/serie/serie.interface';
import { Movie } from '../../core/interfaces/movie/movie.interface';
import { NgOptimizedImage } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { ApiService } from '../../core/services/API/api.service';
import { getHeightContainer } from '../../shared/utils/helpers';
import { Crew } from '../../core/interfaces/people/credits.interface';

@Component({
  selector: 'app-about',
  imports: [NgOptimizedImage],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
 media = input.required<Movie | Serie | undefined>();
 api = inject(ApiService);

 private readonly sinopsysContainer = viewChild<ElementRef<HTMLElement>>('sinopsysContainer')

 credits = toSignal(
    toObservable(this.media).pipe(
      switchMap(media => this.api.getCreditsMovie({ dataId: media?.id }))
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
