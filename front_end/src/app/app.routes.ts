import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'outliner',
    loadComponent: () => import('./outliner/outliner.component'),
  },
  {
    path: '',
    redirectTo: 'outliner',
    pathMatch: 'full',
  }
];
