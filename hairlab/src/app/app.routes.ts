import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth-guard';

import { DashboardComponent } from './features/dashboard/dashboard';
import { LoginComponent } from './features/login/login';

import { ColorAnalysisFormComponent } from './features/customers/color-analysis/color-analysis-form/color-analysis-form';
import { CustomerDetailComponent } from './features/customers/customer-detail/customer-detail';
import { CustomerFormComponent } from './features/customers/customer-form/customer-form';
import { CustomerListComponent } from './features/customers/customer-list/customer-list';
import { FaceProfileFormComponent } from './features/customers/face-profile/face-profile-form/face-profile-form';
import { HairProfileFormComponent } from './features/customers/hair-profile/hair-profile-form/hair-profile-form';

import { AppointmentDetailComponent } from './features/appointments/appointment-detail/appointment-detail';
import { AppointmentFormComponent } from './features/appointments/appointment-form/appointment-form';
import { AppointmentListComponent } from './features/appointments/appointment-list/appointment-list';

import { EmployeeDetailComponent } from './features/employee/employee-detail/employee-detail';
import { EmployeeFormComponent } from './features/employee/employee-form/employee-form';
import { EmployeeListComponent } from './features/employee/employee-list/employee-list';

import { SalonProductFormComponent } from './features/servicesalon/salon-product-form/salon-product-form';
import { SalonProductListComponent } from './features/servicesalon/salon-product-list/salon-product-list';

import { LayoutComponent } from './shared/layout/layout';
import { ConsultationListComponent } from './features/consultation/consultation-list/consultation-list';
import { ConsultationFormComponent } from './features/consultation/consultation-form/consultation-form';
import { ProfileViewComponent } from './features/profile/profile-view/profile-view';
import { ProfileFormComponent } from './features/profile/profile-form/profile-form';

/**
 * Configurazione principale delle route Angular.
 *
 * IMPORTANTE:
 * Le route più specifiche devono essere dichiarate prima delle route generiche o di redirect.
 */
export const routes: Routes = [

  /*
   * ============================================================
   * LOGIN
   * ============================================================
   */
  {
    path: 'login',
    component: LoginComponent
  },

  /*
   * ============================================================
   * AREA PROTETTA
   * ============================================================
   */
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],

    children: [

      /*
       * DASHBOARD
       */
      {
        path: 'dashboard',
        component: DashboardComponent
      },

      /*
       * ========================================================
       * CUSTOMER
       * ========================================================
       */
      {
        path: 'customers',
        component: CustomerListComponent
      },
      {
        path: 'customers/new',
        component: CustomerFormComponent
      },

      /*
       * HAIR PROFILE
       */
      {
        path: 'customers/:customerId/hair-profile/new',
        component: HairProfileFormComponent
      },
      {
        path: 'customers/:customerId/hair-profile/:profileId/edit',
        component: HairProfileFormComponent
      },

      /*
       * FACE PROFILE
       */
      {
        path: 'customers/:customerId/face-profile/new',
        component: FaceProfileFormComponent
      },
      {
        path: 'customers/:customerId/face-profile/:profileId/edit',
        component: FaceProfileFormComponent
      },

      /*
       * COLOR ANALYSIS
       */
      {
        path: 'customers/:customerId/color-analysis/new',
        component: ColorAnalysisFormComponent
      },
      {
        path: 'customers/:customerId/color-analysis/:analysisId/edit',
        component: ColorAnalysisFormComponent
      },

      /*
       * ROUTE CUSTOMER GENERICHE
       */
      {
        path: 'customers/:id/edit',
        component: CustomerFormComponent
      },
      {
        path: 'customers/:id',
        component: CustomerDetailComponent
      },

      /*
       * ========================================================
       * APPOINTMENTS
       * ========================================================
       */
      {
        path: 'appointments',
        component: AppointmentListComponent
      },
      {
        path: 'appointments/new',
        component: AppointmentFormComponent
      },
      {
        path: 'appointments/:id/edit',
        component: AppointmentFormComponent
      },
      {
        path: 'appointments/:id',
        component: AppointmentDetailComponent
      },

      /*
       * ========================================================
       * EMPLOYEES
       * ========================================================
       */
      {
        path: 'employees',
        component: EmployeeListComponent
      },
      {
        path: 'employees/new',
        component: EmployeeFormComponent
      },
      {
        path: 'employees/:id/edit',
        component: EmployeeFormComponent
      },
      {
        path: 'employees/:id',
        component: EmployeeDetailComponent
      },

      /*
       * ========================================================
       * SERVICES (SALON PRODUCTS)
       * ========================================================
       */
      {
        path: 'services',
        component: SalonProductListComponent
      },
      {
        path: 'services/new',
        component: SalonProductFormComponent
      },
      {
        path: 'services/:id/edit',
        component: SalonProductFormComponent
      },

      {
        path: 'consultations',
        component: ConsultationListComponent
      },
      {
        path: 'consultations/new',
        component: ConsultationFormComponent
      },
      {
        path: 'consultations/:id/edit',
        component: ConsultationFormComponent
      },
      {
        path: 'profile',
        component: ProfileViewComponent
      },

      {
        path: 'profile/new',
        component: ProfileFormComponent
      },

      /*
       * REDIRECT INIZIALE (DEVE RIMANERE IN FONDO AI CHILDREN)
       */
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }

    ]
  },

  /*
   * ============================================================
   * FALLBACK
   * ============================================================
   */
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];