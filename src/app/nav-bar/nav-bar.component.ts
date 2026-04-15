import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ComunicatorService } from '../core/services/comunicator/comunicator.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BackgroundNavScrollDirective } from '../core/directives/background-nav-scroll.directive';

@Component({
  selector: 'app-nav-bar',
  imports: [NgClass, RouterLink, FormsModule, RouterLinkActive,BackgroundNavScrollDirective],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  isMenuOpen: boolean = false
  searchQuery: string = ''

  comunicatorService = inject(ComunicatorService)
  private router = inject(Router)

  onSearch() {
    if (this.searchQuery !== '')
      this.router.navigate(['/search/' + this.searchQuery])
  }
}
