import { Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '', loadComponent: () => import('./components/banner/banner.component')
    },
    {
        path: 'watch-movie/:id_movie', loadComponent: () => import('../shared/components/play-movie/play-movie.component'),
    }
];

export default routes