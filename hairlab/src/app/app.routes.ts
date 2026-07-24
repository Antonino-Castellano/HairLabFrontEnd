import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth-guard';
import { LayoutComponent } from './shared/layout/layout';

import { LoginComponent } from './features/login/login';
import { DashboardComponent } from './features/dashboard/dashboard';

import { CustomerListComponent } from './features/customers/customer-list/customer-list';
import { CustomerFormComponent } from './features/customers/customer-form/customer-form';
import { CustomerDetailComponent } from './features/customers/customer-detail/customer-detail';
import { HairProfileFormComponent } from './features/customers/hair-profile/hair-profile-form/hair-profile-form';
import { FaceProfileFormComponent } from './features/customers/face-profile/face-profile-form/face-profile-form';
import { ColorAnalysisFormComponent } from './features/customers/color-analysis/color-analysis-form/color-analysis-form';
import { CustomerColorFormulaHistoryPageComponent } from './features/customers/customer-color-formula-history-page/customer-color-formula-history-page';

import { AppointmentListComponent } from './features/appointments/appointment-list/appointment-list';
import { AppointmentFormComponent } from './features/appointments/appointment-form/appointment-form';
import { AppointmentDetailComponent } from './features/appointments/appointment-detail/appointment-detail';

import { EmployeeListComponent } from './features/employee/employee-list/employee-list';
import { EmployeeFormComponent } from './features/employee/employee-form/employee-form';
import { EmployeeDetailComponent } from './features/employee/employee-detail/employee-detail';

import { SalonProductListComponent } from './features/servicesalon/salon-product-list/salon-product-list';
import { SalonProductFormComponent } from './features/servicesalon/salon-product-form/salon-product-form';

import { ConsultationListComponent } from './features/consultation/consultation-list/consultation-list';
import { ConsultationFormComponent } from './features/consultation/consultation-form/consultation-form';

import { ProfileViewComponent } from './features/profile/profile-view/profile-view';
import { ProfileFormComponent } from './features/profile/profile-form/profile-form';
import { ProfileListComponent } from './features/profile/profile-list/profile-list';

import { ColorLabComponent } from './features/color-lab/color-lab/color-lab';
import { HairDyeFormComponent } from './features/color-lab/hair-dye-form/hair-dye-form';
import { HairDyeInventoryFormComponent } from './features/color-lab/hair-dye-inventory-form/hair-dye-inventory-form';
import { ColorFormulaListComponent } from './features/color-lab/color-formula-list/color-formula-list';
import { ColorFormulaBuilderComponent } from './features/color-lab/color-formula-builder/color-formula-builder';
import { ColorFormulaDetailComponent } from './features/color-lab/color-formula-detail/color-formula-detail';
import { ColorSmartDiagnosisComponent } from './features/color-lab/color-smart-diagnosis/color-smart-diagnosis';
import { ColorProductLineProfileListComponent } from './features/color-lab/color-product-line-profile-list/color-product-line-profile-list';
import { ColorProductLineProfileFormComponent } from './features/color-lab/color-product-line-profile-form/color-product-line-profile-form';

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
      { path: 'dashboard', component: DashboardComponent },

      { path: 'customers', component: CustomerListComponent },
      { path: 'customers/new', component: CustomerFormComponent },
      { path: 'customers/:customerId/hair-profile/new', component: HairProfileFormComponent },
      { path: 'customers/:customerId/hair-profile/:profileId/edit', component: HairProfileFormComponent },
      { path: 'customers/:customerId/face-profile/new', component: FaceProfileFormComponent },
      { path: 'customers/:customerId/face-profile/:profileId/edit', component: FaceProfileFormComponent },
      { path: 'customers/:customerId/color-analysis/new', component: ColorAnalysisFormComponent },
      { path: 'customers/:customerId/color-analysis/:analysisId/edit', component: ColorAnalysisFormComponent },
      { path: 'customers/:id/color-formulas', component: CustomerColorFormulaHistoryPageComponent },
      { path: 'customers/:id/edit', component: CustomerFormComponent },
      { path: 'customers/:id', component: CustomerDetailComponent },

      { path: 'appointments', component: AppointmentListComponent },
      { path: 'appointments/new', component: AppointmentFormComponent },
      { path: 'appointments/:id/edit', component: AppointmentFormComponent },
      { path: 'appointments/:id', component: AppointmentDetailComponent },

      { path: 'employees', component: EmployeeListComponent },
      { path: 'employees/new', component: EmployeeFormComponent },
      { path: 'employees/:id/edit', component: EmployeeFormComponent },
      { path: 'employees/:id', component: EmployeeDetailComponent },

      { path: 'services', component: SalonProductListComponent },
      { path: 'services/new', component: SalonProductFormComponent },
      { path: 'services/:id/edit', component: SalonProductFormComponent },

      { path: 'consultations', component: ConsultationListComponent },
      { path: 'consultations/new', component: ConsultationFormComponent },
      { path: 'consultations/:id/edit', component: ConsultationFormComponent },

      { path: 'profile', component: ProfileViewComponent },
      { path: 'profile/new', component: ProfileFormComponent },
      { path: 'profile/all', component: ProfileListComponent },

      { path: 'color-lab', component: ColorLabComponent },
      { path: 'color-lab/smart-formula', component: ColorSmartDiagnosisComponent },
      { path: 'color-lab/products/new', component: HairDyeFormComponent },
      { path: 'color-lab/products/:id/edit', component: HairDyeFormComponent },
      { path: 'color-lab/inventory/:hairDyeId', component: HairDyeInventoryFormComponent },
      { path: 'color-lab/formulas', component: ColorFormulaListComponent },
      { path: 'color-lab/formulas/new', component: ColorFormulaBuilderComponent },
      { path: 'color-lab/formulas/:id/edit', component: ColorFormulaBuilderComponent },
      { path: 'color-lab/formulas/:id', component: ColorFormulaDetailComponent },
      { path: 'color-lab/lines', component: ColorProductLineProfileListComponent },
      { path: 'color-lab/lines/new', component: ColorProductLineProfileFormComponent },
      { path: 'color-lab/lines/:id/edit', component: ColorProductLineProfileFormComponent },

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
