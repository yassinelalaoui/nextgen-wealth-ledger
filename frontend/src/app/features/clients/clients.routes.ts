import { Routes } from '@angular/router';
import { ClientsComponent } from './clients.component';
import { ClientDetailComponent } from './client-detail.component';

export const CUSTOMERS_ROUTES: Routes = [
  { path: '', component: ClientsComponent },
  { path: ':id', component: ClientDetailComponent }
];
