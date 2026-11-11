import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home', loadComponent: () => import('./pages/inicio/inicio.component'),
    },
    {
        path: 'discover', loadComponent: () => import('./pages/discover/discover.component'),
    },
    {
        path: 'search/:query', loadComponent: () => import('./pages/discover/discover.component'),
    },
    {
        path: 'details/:type/:id', loadComponent: () => import('./pages/media-details/details.component'),
    },
    {
        path: 'watch-movie/:id_movie', loadComponent: () => import('./shared/components/movies/play-movie/play-movie.component'),
    },
    {
        path: 'watch-serie/:id_serie',
        loadComponent: () => import('./shared/components/series/play-serie/play-serie.component'),
    },
   
    { path: '', redirectTo: 'home', pathMatch: 'full' },
];
