export type AnalyticsPreset = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL' | 'CUSTOM';

export interface BusinessAnalyticsSummary {
  grossRevenue: number;
  committedSupplyCosts: number;
  receivedSupplyCosts: number;
  partialOperatingMargin: number;
  averageTicket: number;
  completedAppointments: number;
  completedServices: number;
  uniqueCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  returningCustomerRate: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  cancellationRate: number;
  noShowRate: number;
  lowStockItems: number;
}

export interface AnalyticsTrendPoint {
  key: string;
  label: string;
  revenue: number;
  supplyCosts: number;
  appointments: number;
  services: number;
  newCustomers: number;
}

export interface AnalyticsCustomerRow {
  customerId: number;
  customerName: string;
  totalSpent: number;
  completedAppointments: number;
  completedServices: number;
  averageTicket: number;
}

export interface AnalyticsServiceRow {
  serviceId: number;
  serviceName: string;
  categoryName: string;
  usageCount: number;
  totalMinutes: number;
  revenue: number;
  averagePrice: number;
}

export interface AnalyticsSupplyRow {
  supplierId: number;
  supplierName: string;
  orderCount: number;
  committedCost: number;
  receivedCost: number;
}

export interface AnalyticsColorUsageRow {
  hairDyeId: number;
  code: string;
  name: string;
  brand: string;
  lineName?: string | null;
  unit?: string | null;
  totalQuantity: number;
  usageCount: number;
}

export interface AnalyticsHourBandRow {
  label: string;
  startHour: number;
  endHour: number;
  appointmentCount: number;
  serviceCount: number;
  revenue: number;
}

export interface AnalyticsEmployeeRow {
  employeeId: number;
  employeeName: string;
  serviceCount: number;
  totalMinutes: number;
  revenue: number;
  averageServiceValue: number;
}

export interface AnalyticsStatusRow {
  status: string;
  count: number;
  percentage: number;
}

export interface BusinessAnalyticsDashboard {
  startDate: string;
  endDate: string;
  preset: string;
  generatedAt: string;
  summary: BusinessAnalyticsSummary;
  trend: AnalyticsTrendPoint[];
  topCustomers: AnalyticsCustomerRow[];
  topServices: AnalyticsServiceRow[];
  supplyCosts: AnalyticsSupplyRow[];
  topColors: AnalyticsColorUsageRow[];
  peakHours: AnalyticsHourBandRow[];
  employeePerformance: AnalyticsEmployeeRow[];
  appointmentStatuses: AnalyticsStatusRow[];
  dataQualityWarnings: string[];
}
