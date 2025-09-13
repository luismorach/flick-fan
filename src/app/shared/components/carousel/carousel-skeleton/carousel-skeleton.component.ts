import { Component, ElementRef, input, ViewChild } from '@angular/core';
import { CardMovieSkeletonComponent} from '../card-movie-skeleton/card-movie-skeleton.component';

@Component({
  selector: 'app-carousel-skeleton',
  imports: [CardMovieSkeletonComponent],
  templateUrl: './carousel-skeleton.component.html',
  styleUrl: './carousel-skeleton.component.css'
})
export class CarouselSkeletonComponent {
  @ViewChild('container') container!: ElementRef
  @ViewChild(CardMovieSkeletonComponent, { read: ElementRef }) slide!: ElementRef
  hasHeader = input<boolean>(true)
  numElements = [1]

  ngAfterViewInit() {
    this.createRange()
  }

  createRange() {
    let widthContainer = this.container.nativeElement.offsetWidth
    let widthSlide = this.slide.nativeElement.offsetWidth
    let numSlides = (this.slide && this.container) ? Math.floor(widthContainer / widthSlide) + 1 : 1
    this.numElements = Array.from({ length: numSlides }, (_, i) => i)
  }


}