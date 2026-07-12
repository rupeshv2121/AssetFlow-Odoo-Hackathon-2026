export type BookingStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface Booking {
  id: string;
  assetId: string;
  bookedById: string;
  departmentId: string | null;
  purpose: string | null;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
  asset: { id: string; assetTag: string; name: string };
  bookedBy: { id: string; name: string };
  department: { id: string; name: string } | null;
}
