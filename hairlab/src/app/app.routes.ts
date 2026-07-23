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

import {AppointmentListComponent} from './features/appointments/appointment-list/appointment-list';
import {AppointmentFormComponent} from './features/appointments/appointment-form/appointment-form';
import {AppointmentDetailComponent} from './features/appointments/appointment-detail/appointment-detail';

import { LayoutComponent } from './shared/layout/layout';
import { EmployeeListComponent } from './features/employee/employee-list/employee-list';
import { EmployeeFormComponent } from './features/employee/employee-form/employee-form';
import { EmployeeDetailComponent } from './features/employee/employee-detail/employee-detail';

/**
 * Configurazione principale delle route Angular.
 *
 * IMPORTANTE:
 *
 * Le route più specifiche devono essere dichiarate
 * prima delle route generiche come:
 *
 * customers/:id
 *
 * Altrimenti Angular potrebbe interpretare:
 *
 * customers/1/face-profile/new
 *
 * in modo errato.
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
       * DASHBOARD.
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

      /**
       * Elenco clienti.
       */
      {
        path: 'customers',
        component: CustomerListComponent
      },

      /**
       * Nuova cliente.
       */
      {
        path: 'customers/new',
        component: CustomerFormComponent
      },

      /*
       * ========================================================
       * HAIR PROFILE
       * ========================================================
       */

      /**
       * Nuovo profilo capelli.
       *
       * Esempio:
       *
       * /customers/1/hair-profile/new
       */
      {
        path: 'customers/:customerId/hair-profile/new',
        component: HairProfileFormComponent
      },

      /**
       * Modifica profilo capelli.
       *
       * Esempio:
       *
       * /customers/1/hair-profile/5/edit
       */
      {
        path: 'customers/:customerId/hair-profile/:profileId/edit',
        component: HairProfileFormComponent
      },

      /*
       * ========================================================
       * FACE PROFILE
       * ========================================================
       */

      /**
       * Nuovo profilo del viso.
       *
       * Esempio:
       *
       * /customers/1/face-profile/new
       */
      {
        path: 'customers/:customerId/face-profile/new',
        component: FaceProfileFormComponent
      },

      /**
       * Modifica profilo del viso.
       *
       * Esempio:
       *
       * /customers/1/face-profile/3/edit
       */
      {
        path: 'customers/:customerId/face-profile/:profileId/edit',
        component: FaceProfileFormComponent
      },

      /*
       * ========================================================
       * COLOR ANALYSIS
       * ========================================================
       */

      /**
       * Nuova analisi cromatica.
       *
       * Esempio:
       *
       * /customers/1/color-analysis/new
       */
      {
        path: 'customers/:customerId/color-analysis/new',
        component: ColorAnalysisFormComponent
      },

      /**
       * Modifica analisi cromatica.
       *
       * Esempio:
       *
       * /customers/1/color-analysis/2/edit
       */
      {
        path: 'customers/:customerId/color-analysis/:analysisId/edit',
        component: ColorAnalysisFormComponent
      },

      /*
       * ========================================================
       * ROUTE CUSTOMER GENERICHE
       * ========================================================
       *
       * Devono rimanere DOPO tutte le route specifiche.
       */

      /**
       * Modifica cliente.
       */
      {
        path: 'customers/:id/edit',
        component: CustomerFormComponent
      },

      /**
       * Dettaglio cliente.
       */
      {
        path: 'customers/:id',
        component: CustomerDetailComponent
      },

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
       * Redirect iniziale.
       */
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'employee',
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