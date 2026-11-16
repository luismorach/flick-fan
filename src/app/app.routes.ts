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
        path: 'watch/:type/:id', loadComponent: () => import('./pages/watch/watch.component'),
    },
    {
        path: 'watch/:type/:id/:season_number/:episode_number', loadComponent: () => import('./pages/watch/watch.component'),
    },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
];
