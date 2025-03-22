import { Routes } from '@angular/router';

export const routes: Routes = [ {
    path: '', loadComponent: () => import('./inicio/inicio.component'),
},
{
    path: 'watch-movie/:id_movie', loadComponent: () => import('./shared/components/play-movie/play-movie.component'),
}];
