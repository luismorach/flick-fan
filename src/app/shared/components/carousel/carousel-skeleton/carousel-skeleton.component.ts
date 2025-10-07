import { Component, ElementRef, input, ViewChild } from '@angular/core';
import { CardMovieSkeletonComponent} from '../card-movie-skeleton/card-movie-skeleton.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-carousel-skeleton',
  imports: [CardMovieSkeletonComponent,NgClass],
  templateUrl: './carousel-skeleton.component.html',
  styleUrl: './carousel-skeleton.component.css'
})
export class CarouselSkeletonComponent {
  @ViewChild('container') skeletonContainer!: ElementRef
  @ViewChild(CardMovieSkeletonComponent, { read: ElementRef }) sampleSlide!: ElementRef
  hasHeader = input<boolean>(true)
  skeletonItems:number[] = [1]

  ngAfterViewInit() {
    this.calculateSkeletonItems()
  }

  calculateSkeletonItems() {
    let widthContainer = this.skeletonContainer.nativeElement.offsetWidth
    let widthSlide = this.sampleSlide.nativeElement.offsetWidth
    let numSlides = (this.sampleSlide && this.skeletonContainer) ? Math.floor(widthContainer / widthSlide) + 1 : 1
    this.skeletonItems = Array.from({ length: numSlides }, (_, i) => i)
  }


}