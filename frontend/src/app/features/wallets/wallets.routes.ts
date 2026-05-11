import { Routes } from '@angular/router';
import { AccountsComponent } from './wallets.component';
import { AccountDetailComponent } from './account-detail.component';

export const ACCOUNTS_ROUTES: Routes = [
  { path: '', component: AccountsComponent },
  { path: ':id', component: AccountDetailComponent }
];
