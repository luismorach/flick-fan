import { DecimalPipe} from '@angular/common';
import { Component, input} from '@angular/core';
import { IconComponent } from "../../icon/icon.component";

@Component({
  selector: 'app-rating',
  imports: [DecimalPipe, IconComponent],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.css'
})
export class RatingComponent {
  rating = input.required<number | undefined>()

  calculatePercent = (index: number) : number => {
    // Ejemplo: si la calificación es 3.5, la estrella en index 3 (la cuarta) devuelve 50
    // Aquí pones tu lógica actual, pero que retorne el número limpio.
    const base = index * 2;
    const score = (this.rating() ?? 0) - base;
    return score >= 2 ? 100 : score <= 0 ? 0 : Number(((score / 2) * 100).toFixed(2));
  }

}
