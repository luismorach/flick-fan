import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';

export const routes: Routes = [{
    path:'',loadComponent:()=>import('./inicio/inicio.component').then((c)=>c.InicioComponent)
}];
