import { Component, effect, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { IconComponent } from '../../../../icon/icon.component';
import { CarouselService } from '../../../../../core/services/test/carousel/carousel-service';

@Component({
  selector: 'app-carousel-navigation-test',
  imports: [NgClass, IconComponent],
  templateUrl: './carousel-navigation.component.html',
  styleUrl: './carousel-navigation.component.css'
})
export class CarouselNavigationComponent<T extends Object, R extends keyof T> {
  readonly carouselService = input.required<CarouselService<T, R>>();
}