import { apiClient } from "@/services/apiClient";
import { Booking } from "@/types/booking";

export interface BookingFilters {
  assetId?: string;
  from?: string;
  to?: string;
}

export async function listBookings(filters: BookingFilters = {}): Promise<Booking[]> {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
  const { data } = await apiClient.get<{ bookings: Booking[] }>("/bookings", { params });
  return data.bookings;
}

export interface CreateBookingInput {
  assetId: string;
  purpose?: string;
  startTime: string;
  endTime: string;
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const { data } = await apiClient.post<{ booking: Booking }>("/bookings", input);
  return data.booking;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const { data } = await apiClient.patch<{ booking: Booking }>(`/bookings/${id}/cancel`);
  return data.booking;
}

export async function rescheduleBooking(id: string, startTime: string, endTime: string): Promise<Booking> {
  const { data } = await apiClient.patch<{ booking: Booking }>(`/bookings/${id}`, { startTime, endTime });
  return data.booking;
}
