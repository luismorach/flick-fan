import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ComunicatorService } from '../shared/services/comunicator/comunicator.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-nav-bar',
    imports: [NgClass,RouterLink],
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  show:boolean=false
  constructor(public comunicatorService: ComunicatorService) {
    console.log(comunicatorService.getBackgroundNav()())
  }
}
