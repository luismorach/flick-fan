import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home', loadComponent: () => import('./inicio/inicio.component'),
    },
    {
        path: 'movies', loadComponent: () => import('./movies/movies.component'),
    },
    {
        path: 'series', loadComponent: () => import('./series/series.component'),
    },
    {
        path: 'search/:wordSearch', loadComponent: () => import('./search/search.component'),
    },
    {
        path: 'watch-movie/:id_movie', loadComponent: () => import('./shared/components/play-movie/play-movie.component'),
    },
    {
        path: 'watch-serie/:id_serie',
        loadComponent: () => import('./shared/components/play-serie/play-serie.component'),
    },
    {
        path: 'details-movie/:id_movie', loadComponent: () => import('./movies/details-movie/details-movie.component'),
    },
    {
        path: 'details-serie/:id_serie', loadComponent: () => import('./series/details-serie/details-serie.component'),
    },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
];
