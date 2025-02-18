import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-nav-bar',
    imports: [NgClass],
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  show:boolean=false
  showBackground:boolean=false
}
