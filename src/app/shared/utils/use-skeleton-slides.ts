import { computed, DestroyRef, effect, inject } from '@angular/core';
import { WindowService } from '../../core/services/window/window.service';

export function useSkeletonSlides(slideBaseWidth: number, isCarousel: boolean = false) {
  if (slideBaseWidth <= 0) {
    throw new Error('slideBaseWidth debe ser mayor a 0');
  }

  const destroyRef = inject(DestroyRef);
  const CAROUSEL_MIN_SPACING = 10;
  const PEEK_SPACING_RATIO = 0.04;
  const MIN_SLIDES_PER_VIEW = 1;
  const windowResize = inject(WindowService);
  const minSpaceBetweenSlides = isCarousel ? CAROUSEL_MIN_SPACING : 0;

  const layout = computed(() => {
    const peekWidth = Math.floor(slideBaseWidth * PEEK_SPACING_RATIO);
    const totalPeekWidth = peekWidth * 2;
    const viewportWidth = windowResize.width();
    const availableWidth = viewportWidth - minSpaceBetweenSlides - totalPeekWidth;

    // Calcular cuántas slides caben
    const totalSlideWidth = slideBaseWidth + minSpaceBetweenSlides;
    const calculatedSlides = Math.floor(availableWidth / totalSlideWidth);
    const slides = Math.max(MIN_SLIDES_PER_VIEW, calculatedSlides);

    // Calcular spacing óptimo
    const usedBySlides = slides * slideBaseWidth;
    const remainingSpace = viewportWidth - usedBySlides - totalPeekWidth;
    const totalGaps = slides + 1;
    const spacing = Math.max(
      minSpaceBetweenSlides,
      Math.floor(remainingSpace / totalGaps)
    );

    // Calcular píxeles no asignados (para centrar)
    const totalUsed = (slides * slideBaseWidth) + (spacing * totalGaps) + totalPeekWidth;
    const unallocated = Math.max(0, viewportWidth - totalUsed);

    // Padding final = peek + mitad de píxeles no asignados
    const padding = peekWidth + Math.floor(unallocated / 2);

    return {
      slidesPerView: slides,
      spaceBetween: spacing,
      paddingX: padding,
      unallocatedPixels: unallocated
    };
  });

  const slidesPerView = computed(() => layout().slidesPerView);
  const spaceBetween = computed(() => layout().spaceBetween);
  const paddingX = computed(() => layout().paddingX);

  const skeletonSlideIndexes = computed(() =>
    Array.from({ length: slidesPerView() }, (_, i) => i)
  );

  const slidesCount = computed(() => skeletonSlideIndexes().length);
  const hasSlides = computed(() => slidesCount() > 0);

  // API simple - retornando los computed directamente
  return {
    slidesPerView,
    skeletonSlideIndexes,
    slidesCount,
    hasSlides,
    slideBaseWidth,
    spaceBetween,
    paddingX,

    // Hook para reaccionar a cambios
    onSlidesChange: (callback: (indexes: readonly number[]) => void) => {
      const effectRef = effect(() => callback(skeletonSlideIndexes()));
      destroyRef.onDestroy(() => effectRef.destroy());
    },
  };
}

// Tipo para el retorno de la función
export type SkeletonSlidesHook = ReturnType<typeof useSkeletonSlides>;