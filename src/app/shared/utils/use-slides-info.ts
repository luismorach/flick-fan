import { computed, effect, ElementRef, inject, Signal } from '@angular/core';
import { slidesConfig as SlidesConfig } from '../../core/interfaces/shared/carousel-interface';
import { mainAxisMetrics, useResizeObserver } from './use-resize-observer';
import { WindowService } from '../../core/services/window/window.service';

export interface SlidesInfoLayout {
  slidesPerView: number
  spaceBetween: number,
  spacingToCenterSlide: number,
  expandedSlideSize: number,
  viewportMainAxisSize: number,
  slideMainAxisSize: number,
  slideMainAxisSizeWithGap: number,
  peekSize: number,
}

interface NormalizedSlidesConfig {
  peekSize: number;
  spaceBetween: number;
  slidesPerView: number;
  expandedMultiplier: number;
  direction: 'horizontal' | 'vertical';
  maxScale: number;
  aspectRatio?: number
}

export function useSlidesInfo(container: Signal<ElementRef<HTMLElement> | undefined>, slidesConfig: SlidesConfig) {

  const mainAxisMetrics = useResizeObserver(container);
  const activeConfig = computed(() => getActiveConfig(mainAxisMetrics().windowsWidth, slidesConfig));
  const direction = computed(() => activeConfig().containerOrientation ?? 'horizontal');

  const layout = computed<SlidesInfoLayout>(() => {
    const mainAxisMetricsRef = mainAxisMetrics()
    const config = activeConfig()
    const normalizedConfig = normalizeConfig(config);

    const isVertical = normalizedConfig.direction === 'vertical' ? true : false
    const viewportMainAxisSize = isVertical ? mainAxisMetricsRef.height : mainAxisMetricsRef.width
    const sizes = calculateSlideSizes(mainAxisMetricsRef, normalizedConfig);
    const spacing = calculateCenterSpacing(
      viewportMainAxisSize,
      sizes.slideMainAxisSize,
      config.centeredSlides
    );

    return {
      ...normalizedConfig,
      ...sizes,
      spacingToCenterSlide: spacing,
    };
  });

  const extraSkeletonForPeek = computed(() => activeConfig().peekSkeletonOffset ?? 0);

  const visibleSkeletonsCount = computed(() => {
    const activeConfigRef = activeConfig()
    if (!activeConfigRef.skeletonCount) return layout().slidesPerView
    return Math.max(0, activeConfigRef.skeletonCount)
  })

  const hasSlides = computed(() => visibleSkeletonsCount() > 0);

  const skeletonSlideIndexes = computed(() => {
    const skeletons = visibleSkeletonsCount() + extraSkeletonForPeek()
    return Array.from({ length: skeletons }, (_, i) => i)
  });

  return {
    layout,
    direction,
    skeletonSlideIndexes,
    visibleSkeletonsCount,
    hasSlides
  };
}

function getActiveConfig(viewportWidth: number, baseConfig: SlidesConfig): SlidesConfig {
  const { breakpoints, ...base } = baseConfig;

  if (!breakpoints || viewportWidth <= 0) return base;

  const activeBreakpoint = Object.keys(breakpoints)
    .map(Number)
    .sort((a, b) => a - b)
    .filter(bp => viewportWidth >= bp)
    .pop();

  const activeConfig = (activeBreakpoint ? breakpoints[activeBreakpoint] : {})

  /* console.log('activeConfig', {...base, ...activeConfig}, activeBreakpoint,breakpoints, viewportWidth) */

  return {
    ...base,
    ...(activeBreakpoint ? breakpoints[activeBreakpoint] : {})
  };
}

function normalizeConfig(config: SlidesConfig): NormalizedSlidesConfig {
  return {
    peekSize: Math.max(0, config.peek ?? 0),
    spaceBetween: Math.max(0, config.spaceBetween ?? 0),
    slidesPerView: Math.max(1, config.slidesPerView ?? 1),
    expandedMultiplier: Math.max(1, config.expandedSlideMultiplier ?? 1),
    direction: config.containerOrientation ?? 'horizontal',
    maxScale: Math.max(1, config.maxScale ?? 1),
    aspectRatio: config.aspectRatio
  };
}

function calculateSlideSizes(mainAxisMetrics: mainAxisMetrics, config: NormalizedSlidesConfig) {
  const isVertical = config.direction === 'vertical' ? true : false
  const viewportSize = isVertical ? mainAxisMetrics.height : mainAxisMetrics.width
  const aspectRatio = config.aspectRatio
  let slideMainAxisSize: number

  const availableSize = viewportSize
    - ((config.slidesPerView - 1) * config.spaceBetween)
    - (config.peekSize * 2);

  const safeAvailableSize = Math.max(0, availableSize);

  if (aspectRatio && config.direction === 'vertical') {
    const safeWidth = Math.max(1, mainAxisMetrics.width);
    const slideCrossSize = safeWidth / config.maxScale
    slideMainAxisSize = slideCrossSize / Math.max(1, aspectRatio)
  } else {
    slideMainAxisSize = safeAvailableSize / Math.max(1, config.slidesPerView)
  }

  const expandedSlideSize = slideMainAxisSize * config.expandedMultiplier;
  const slideMainAxisSizeWithGap = slideMainAxisSize + config.spaceBetween;

  return {
    viewportMainAxisSize: viewportSize,
    slideMainAxisSize,
    expandedSlideSize,
    slideMainAxisSizeWithGap,
  };
}

function calculateCenterSpacing(
  viewportSize: number,
  slideSize: number,
  centered?: boolean
): number {
  return (centered ?? false) ? (viewportSize - slideSize) / 2 : 0;
}

export type SlidesInfoHook = ReturnType<typeof useSlidesInfo>;












