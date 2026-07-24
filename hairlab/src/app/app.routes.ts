import { Routes } from '@angular/router';

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
import { HairDyeInventoryMovementListComponent } from './features/color-lab/hair-dye-inventory-movement-list/hair-dye-inventory-movement-list';
import { ColorFormulaListComponent } from './features/color-lab/color-formula-list/color-formula-list';
import { ColorFormulaBuilderComponent } from './features/color-lab/color-formula-builder/color-formula-builder';
import { ColorFormulaDetailComponent } from './features/color-lab/color-formula-detail/color-formula-detail';
import { ColorSmartDiagnosisComponent } from './features/color-lab/color-smart-diagnosis/color-smart-diagnosis';
import { ColorProductLineProfileListComponent } from './features/color-lab/color-product-line-profile-list/color-product-line-profile-list';
import { ColorProductLineProfileFormComponent } from './features/color-lab/color-product-line-profile-form/color-product-line-profile-form';
import { roleGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LayoutComponent,
    // Nota: NESSUN canActivate qui sul padre per evitare blocchi a catena
    children: [
      { 
        path: 'dashboard', 
        component: DashboardComponent, 
        canActivate: [roleGuard], 
        data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST'] } 
      },

      // Customers
      { path: 'customers', component: CustomerListComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST'] } },
      { path: 'customers/new', component: CustomerFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST'] } },
      { path: 'customers/:customerId/hair-profile/new', component: HairProfileFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'customers/:customerId/hair-profile/:profileId/edit', component: HairProfileFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'customers/:customerId/face-profile/new', component: FaceProfileFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'customers/:customerId/face-profile/:profileId/edit', component: FaceProfileFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'customers/:customerId/color-analysis/new', component: ColorAnalysisFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'customers/:customerId/color-analysis/:analysisId/edit', component: ColorAnalysisFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'customers/:id/color-formulas', component: CustomerColorFormulaHistoryPageComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'customers/:id/edit', component: CustomerFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST'] } },
      { path: 'customers/:id', component: CustomerDetailComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST'] } },

      // Appointments
      { path: 'appointments', component: AppointmentListComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST', 'CUSTOMER'] } },
      { path: 'appointments/new', component: AppointmentFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST'] } },
      { path: 'appointments/:id/edit', component: AppointmentFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST'] } },
      { path: 'appointments/:id', component: AppointmentDetailComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST'] } },

      // Employees (Aggiungi canActivate se vuoi proteggerli, qui lascio aperto o protetto a seconda delle tue esigenze, es. solo ADMIN)
      { path: 'employees', component: EmployeeListComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'employees/new', component: EmployeeFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'employees/:id/edit', component: EmployeeFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'employees/:id', component: EmployeeDetailComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },

      // Services
      { path: 'services', component: SalonProductListComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST', 'CUSTOMER'] } },
      { path: 'services/new', component: SalonProductFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'services/:id/edit', component: SalonProductFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },

      // Consultations
      { path: 'consultations', component: ConsultationListComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST', 'CUSTOMER'] } },
      { path: 'consultations/new', component: ConsultationFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST'] } },
      { path: 'consultations/:id/edit', component: ConsultationFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST'] } },

      // Profile
      { path: 'profile', component: ProfileViewComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST', 'CUSTOMER'] } },
      { path: 'profile/new', component: ProfileFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'profile/all', component: ProfileListComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'profile/edit/:id', component: ProfileFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },

      // Color Lab
      { path: 'color-lab', component: ColorLabComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST'] } },
      { path: 'color-lab/smart-formula', component: ColorSmartDiagnosisComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST'] } },
      { path: 'color-lab/products/new', component: HairDyeFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'color-lab/products/:id/edit', component: HairDyeFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'color-lab/movements', component: HairDyeInventoryMovementListComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'color-lab/inventory/:hairDyeId', component: HairDyeInventoryFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'color-lab/formulas', component: ColorFormulaListComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST'] } },
      { path: 'color-lab/formulas/new', component: ColorFormulaBuilderComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'color-lab/formulas/:id/edit', component: ColorFormulaBuilderComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'color-lab/formulas/:id', component: ColorFormulaDetailComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN', 'RECEPTIONIST'] } },
      { path: 'color-lab/lines', component: ColorProductLineProfileListComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'color-lab/lines/new', component: ColorProductLineProfileFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },
      { path: 'color-lab/lines/:id/edit', component: ColorProductLineProfileFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'SUPERADMIN'] } },

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];