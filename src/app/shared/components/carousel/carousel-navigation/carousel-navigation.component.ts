import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { CarouselService } from '../../../../core/services/carousel/carousel-service';
import { IconComponent } from "../../../icon/icon.component";

@Component({
  selector: 'app-carousel-navigation',
  imports: [NgClass, IconComponent],
  templateUrl: './carousel-navigation.component.html',
  styleUrl: './carousel-navigation.component.css'
})
export class CarouselNavigationComponent<T extends Object, R extends keyof T> {
  readonly carouselService = input.required<CarouselService<T, R>>();
}