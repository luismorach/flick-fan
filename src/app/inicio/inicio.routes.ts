import { Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'details-movie/:id_movie', loadComponent: () => import('../shared/components/details-movie/details-movie.component'),
    },
    {
        path: 'watch-movie/:id_movie', loadComponent: () => import('../shared/components/play-movie/play-movie.component'),
    }
];

export default routes