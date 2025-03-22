import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ComunicatorService } from '../shared/services/comunicator/comunicator.service';

@Component({
    selector: 'app-nav-bar',
    imports: [NgClass],
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  show:boolean=false
  constructor(public comunicatorService: ComunicatorService) {
    console.log(comunicatorService.getBackgroundNav()())
  }
}
