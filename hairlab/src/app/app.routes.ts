import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { DashboardComponent } from './features/dashboard/dashboard';
import { CustomerListComponent } from './features/customers/customer-list/customer-list';
import { CustomerFormComponent } from './features/customers/customer-form/customer-form';
import { CustomerDetailComponent } from './features/customers/customer-detail/customer-detail';
import { HairProfileFormComponent } from './features/customers/hair-profile/hair-profile-form/hair-profile-form';
import { LayoutComponent } from './shared/layout/layout';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'customers',
        component: CustomerListComponent
      },
      {
        path: 'customers/new',
        component: CustomerFormComponent
      },
      {
        path: 'customers/:customerId/hair-profile/new',
        component: HairProfileFormComponent
      },
      {
        path: 'customers/:customerId/hair-profile/:profileId/edit',
        component: HairProfileFormComponent
      },
      {
        path: 'customers/:id/edit',
        component: CustomerFormComponent
      },
      {
        path: 'customers/:id',
        component: CustomerDetailComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
