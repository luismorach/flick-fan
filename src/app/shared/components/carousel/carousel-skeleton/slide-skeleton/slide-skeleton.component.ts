import { Component, input } from '@angular/core';

@Component({
  selector: 'app-slide-skeleton',
  imports: [],
  templateUrl: './slide-skeleton.component.html',
  styleUrl: './slide-skeleton.component.css'
})
export class SlideSkeletonComponent {

  hasMargin=input.required<boolean>()
}
