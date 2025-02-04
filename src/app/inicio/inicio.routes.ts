import { Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '', loadComponent: () => import('./components/banner/banner.component'),

    }
];

export default routes