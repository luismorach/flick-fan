import { DecimalPipe, NgClass } from '@angular/common';
import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'app-rating',
  imports: [NgClass,DecimalPipe],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.css'
})
export class RatingComponent {
  rating= input.required<number | undefined> ()
  
  calculatePercent = (index: number) => {
    const base = index * 2;
    const diff = (this.rating() ?? 0) - base;

    if (diff >= 2) {
      return { 'from-100% to-100%': true };
    } else if (diff <= 0) {
      return { 'from-0% to-0%': true };
    } else {
      const percent = ((diff / 2) * 100).toFixed(2);
      return { [`from-[${percent}%] to-[${percent}%]`]: true };
    }
  }
  
}
