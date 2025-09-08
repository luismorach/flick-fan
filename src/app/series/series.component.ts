import { Component, effect, ElementRef, HostListener, inject, Renderer2, signal, ViewChild, WritableSignal } from '@angular/core';
import { BannerSeriesComponent } from '../inicio/components/banner-series/banner-series.component';
import { SkeletonComponent } from '../inicio/components/banner-series/skeleton/skeleton.component';
import { ApiService } from '../shared/services/API/api.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import { listSeries } from '../shared/interfaces/interfaces';
import { fade } from '../shared/animations/animations';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { calculateNumSlides, clearAllAnimationsFrame, clearAllTimeouts, startAnimationFrame, startTimeOut, waitForAnimationFrame, waitForTransitionEnd } from '../shared/utils/carousel';
import { CardSerieComponent } from '../shared/components/carousel-series/card-serie/card-serie.component';
import { SlideSkeletonComponent } from '../shared/components/carousel-series/slide-skeleton/slide-skeleton.component';
import { CarouselSeriesSkeletonComponent } from '../shared/components/carousel-series/carousel-series-skeleton/carousel-series-skeleton.component';
import { ComunicatorService } from '../shared/services/comunicator/comunicator.service';

@Component({
  selector: 'app-series',
  imports: [BannerSeriesComponent, SkeletonComponent, InfiniteScrollDirective,
    CardSerieComponent, SlideSkeletonComponent, CarouselSeriesSkeletonComponent, CommonModule],
  templateUrl: './series.component.html',
  styleUrl: './series.component.css',
  animations: [fade]
})
export default class SeriesComponent {
  API = inject(ApiService)
  doc = inject(DOCUMENT)
  airingToday: WritableSignal<listSeries | undefined> = signal(undefined)
  onTheAir: WritableSignal<listSeries | undefined> = signal(undefined)
  popularSeries: WritableSignal<listSeries | undefined> = signal(undefined)
  numSeries = 0
  numElements!: number[]
  isLoading: WritableSignal<boolean> = signal(false)
  spaceBetween=42

   @HostListener("window:scroll", ['$event'])
  enableBackgroundNav(event: any) {
    let offset = event.srcElement.children[0].scrollTop
    if (offset > 20) {
      this.comunicatorService.setBackgroundNav(true)
    } else {
      this.comunicatorService.setBackgroundNav(false)
    }
  }

  constructor(private comunicatorService:ComunicatorService) {
    this.doc.scrollingElement?.scrollTo(0, 0)
    effect(() => {
      this.API.getPopularSeries(1).subscribe(data => this.popularSeries.set(data))
    })
    effect(() => {
      console.log('primeros dattos')
      this.API.getOnTheAirSeries(1).subscribe(data => this.onTheAir.set(data))
    })
  }

  ngAfterViewInit() {
    this.numSeries = calculateNumSlides(this.doc.scrollingElement?.scrollWidth ?? 0, 336)
    this.numElements = Array.from({ length: this.numSeries }, (_, i) => i)
    console.log(this.numSeries)

  }

  onScroll() {
    this.isLoading.set(true)
    console.log('pidiendo mas datos')
    this.API.getMoreData(this.API.getPopularSeries.bind(this.API), this.popularSeries)
  }
  get results() {
    return this.popularSeries()?.results ?? [];
  }

  mouseEnter(event: any, index: number) {
    const child = event.target as HTMLElement;
    const parent = child.parentElement as HTMLElement;

    //parent.style.width =  (this.doc.scrollingElement?.scrollWidth ?? 0)+806 + 'px'
    console.log('entro', child.offsetLeft, child.offsetWidth, parent.clientWidth, child, index)
    startTimeOut(() => {
      if (index > 1)
        parent.scrollLeft = (child.offsetLeft + Math.floor(child.offsetWidth * 2.8)) - parent.clientWidth - this.spaceBetween
    }, 300)

    console.log(parent)
  }

  mouseLeave(event: any) {
    const child = event.target as HTMLElement;
    const parent = child.parentElement as HTMLElement;
    parent.scrollLeft=0
  }

}
