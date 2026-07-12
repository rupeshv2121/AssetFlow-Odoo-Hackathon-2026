import { useAuth } from "@/context/AuthContext";

// Placeholder landing page confirming the auth flow works end-to-end.
// Dev A: replace with real KPI cards (Assets Available/Allocated, Maintenance
// Today, Active Bookings, Pending Transfers, Upcoming/Overdue Returns).
export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Welcome, {user?.name}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Signed in as <span className="font-medium">{user?.role}</span>. KPI cards land here.
      </p>
    </div>
  );
}
