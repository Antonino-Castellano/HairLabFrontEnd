import { AppointmentStatus } from './enums/appointment-status';
import { JobTitle } from './enums/job-title';
import { Specialization } from './enums/specialization';
import { Appointment } from './appointment';
import { Consultation } from './consultation';
import { CustomerAnalysis } from './customer-analysis';
import { Customer } from './customer';
import { SalonProduct } from './salon-product';
import { StyleRecommendation } from './style-recommendation';

export interface CustomerPortalEmployee {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: JobTitle;
  specializations: Specialization[];
  profileImage?: string | null;
  publicDescription: string;
}

export interface CustomerPortalAppointmentItem {
  id: number;
  salonProductId?: number | null;
  serviceName: string;
  employeeId?: number | null;
  employeeName: string;
  scheduledTime: string;
  duration: number;
  agreedPrice: number;
  completedAt?: string | null;
}

export interface CustomerPortalAppointment {
  id: number;
  startDateTime: string;
  status: AppointmentStatus;
  notes?: string | null;
  createdAt?: string | null;
  totalDuration: number;
  totalPrice: number;
  cancellable: boolean;
  items: CustomerPortalAppointmentItem[];
}

export interface CustomerBookingSlotRequest {
  salonProductId: number;
  employeeId: number;
  date: string;
  windowStart?: string;
  windowEnd?: string;
}

export interface CustomerBookingSlot {
  startDateTime: string;
  endDateTime: string;
  totalDuration: number;
}

export interface CustomerSelfBookingRequest {
  salonProductId: number;
  employeeId: number;
  startDateTime: string;
  notes?: string;
}

export interface CustomerArea {
  customer: Customer;
  generatedAt: string;
  appointments: Appointment[];
  appointmentDetails: CustomerPortalAppointment[];
  consultations: Consultation[];
  services: SalonProduct[];
  employees: CustomerPortalEmployee[];
  recommendations: StyleRecommendation;
  analysis: CustomerAnalysis;
}
