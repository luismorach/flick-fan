import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home', loadComponent: () => import('./inicio/inicio.component'),
    },
    {
        path: 'watch-movie/:id_movie', loadComponent: () => import('./shared/components/play-movie/play-movie.component'),
    },
    {
        path: 'watch-serie/:id_serie', 
        loadComponent: () => import('./shared/components/play-serie/play-serie.component'),
    },
    {
        path: 'details-movie/:id_movie', loadComponent: () => import('./shared/components/details-movie/details-movie.component'),
    },
    {
        path: 'details-serie/:id_serie', loadComponent: () => import('./shared/components/details-serie/details-serie.component'),
    },
    { path: '', redirectTo: 'home', pathMatch: 'full' }, 
];
