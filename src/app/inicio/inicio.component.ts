import { Component, ChangeDetectionStrategy} from '@angular/core';
import { RouterOutlet, provideRouter } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';


@Component({
    selector: 'app-inicio',
    imports: [RouterOutlet,NavBarComponent],
    templateUrl: './inicio.component.html',
    styleUrl: './inicio.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class InicioComponent {
  

}
