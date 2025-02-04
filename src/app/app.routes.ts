import { Routes } from '@angular/router';

export const routes: Routes = [{
    path:'',loadChildren:()=>import('./inicio/inicio.routes')
}];
