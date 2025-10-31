import { Pipe, PipeTransform, computed, inject } from '@angular/core';
import { SkeletonSlidesHook } from '../../utils/use-skeleton-slides';
import { MovieList } from '../../../core/interfaces/movie/movie.interface';

@Pipe({
  name: 'cardMovieClass',
  pure: true,
  standalone: true
})
export class CardMovieClassPipe implements PipeTransform {

  transform(slides: SkeletonSlidesHook, index: number): string {
    
    const slidesPerView = slides.slidesPerView();
    if (slidesPerView <= 1) return 'origin-center';

    const position = index % slidesPerView;

    if (position === 0) return 'origin-left';
    if (position === slidesPerView - 1) return 'origin-right';
    return 'origin-center';
  }
}