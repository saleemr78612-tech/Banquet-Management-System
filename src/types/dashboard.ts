export interface BusinessSettings {
  banquetName: string;
  logoDataUrl?: string;
  address: string;
  phone: string;
  email: string;
  city: string;
}

export interface DashboardStats {
  totalBookings: number;
  upcomingEvents: number;
  totalCustomers: number;
  totalRevenue: number;
  amountReceived: number;
  remainingAmount: number;
}

export interface MonthlyPoint {
  month: string;
  bookings: number;
  revenue: number;
}

export interface EventTypeCount {
  type: string;
  count: number;
}
