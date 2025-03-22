import { Component, ChangeDetectionStrategy} from '@angular/core';
import { RouterOutlet, provideRouter } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import BannerComponent from './components/banner/banner.component';
import { PopularComponent } from './components/popular/popular.component';


@Component({
    selector: 'app-inicio',
    imports: [RouterOutlet,NavBarComponent,BannerComponent,PopularComponent],
    templateUrl: './inicio.component.html',
    styleUrl: './inicio.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class InicioComponent {
  

}
