import { Component, input } from '@angular/core';

@Component({
  selector: 'app-carousel-header',
  imports: [],
  templateUrl: './carousel-header.component.html',
  styleUrl: './carousel-header.component.css'
})
export class CarouselHeaderComponent {
  readonly title = input.required<string>()
  readonly subtitle = input<string>()
}
