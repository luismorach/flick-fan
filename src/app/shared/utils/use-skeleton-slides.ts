// shared/skeleton-slides.hook.ts - VERSION COMPATIBLE
import { signal, computed, effect } from '@angular/core';

// Configurar listener global una sola vez
const windowWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1024);

// Variable para controlar el listener
let resizeListenerConfigured = false;

if (typeof window !== 'undefined' && !resizeListenerConfigured) {
  window.addEventListener('resize', () => {
    console.log('resizeando',window.innerWidth)
    windowWidth.set(window.innerWidth)});
  resizeListenerConfigured = true;
}

export function useSkeletonSlides(slideBaseWidth = 300, spaceBetween = 16) {
  // Signals configurables
  const slideWidth = signal(slideBaseWidth);
  const spacing = signal(spaceBetween);

  // Computed reactivos
  const slidesPerView = computed(() => {
    const width = windowWidth();
    const totalSlideWidth = slideWidth() + spacing();
    return Math.floor(width / totalSlideWidth) || 1;
  });

  const skeletonSlideIndexes = computed(() => 
    Array.from({ length: slidesPerView() }, (_, i) => i)
  );

  const slidesCount = computed(() => skeletonSlideIndexes().length);
  const hasSlides = computed(() => slidesCount() > 0);

  // API simple - retornando los computed directamente
  return {
    // Signals de solo lectura (usando los computed directamente)
    slidesPerView,
    skeletonSlideIndexes,
    slidesCount,
    hasSlides,
    slideBaseWidth: computed(() => slideWidth()),
    spaceBetween: computed(() => spacing()),
    
    // Métodos de actualización
    updateSlideWidth: (width: number) => slideWidth.set(width),
    updateSpacing: (space: number) => spacing.set(space),
    updateDimensions: (width: number, space: number) => {
      slideWidth.set(width);
      spacing.set(space);
    },
    
    // Hook para reaccionar a cambios
    onSlidesChange: (callback: (indexes: number[]) => void) => {
      const effectRef = effect(() => callback(skeletonSlideIndexes()));
      return effectRef; 
    },

    // Getters para obtener valores actuales (útil para lógica imperativa)
    getCurrentSlidesPerView: () => slidesPerView(),
    getCurrentIndexes: () => skeletonSlideIndexes(),
    getCurrentSlideWidth: () => slideWidth(),
    getCurrentSpacing: () => spacing()
  };
}

// Tipo para el retorno de la función
export type SkeletonSlidesHook = ReturnType<typeof useSkeletonSlides>;