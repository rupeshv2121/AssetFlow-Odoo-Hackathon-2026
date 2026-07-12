import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarClock, Clock } from "lucide-react";
import * as bookingService from "@/services/bookingService";
import * as assetService from "@/services/assetService";
import { useAuth } from "@/context/AuthContext";
import { Booking } from "@/types/booking";
import { Asset } from "@/types/asset";

const statusColor: Record<string, string> = {
  UPCOMING: "bg-sky-100 text-sky-700",
  ONGOING: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-gray-100 text-gray-500",
  CANCELLED: "bg-red-100 text-red-700",
};

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

function startsInLabel(startTime: string) {
  const diffMs = new Date(startTime).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `starts in ${mins}m`;
  if (mins < 24 * 60) return `starts in ${Math.round(mins / 60)}h`;
  return null;
}

const emptyForm = { purpose: "", startTime: "", endTime: "" };

export default function ResourceBooking() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectAssetId = searchParams.get("assetId");

  const [bookableAssets, setBookableAssets] = useState<Asset[]>([]);
  const [assetId, setAssetId] = useState(preselectAssetId || "");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ startTime: "", endTime: "" });
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  useEffect(() => {
    assetService
      .listAssets()
      .then((all) => {
        const bookable = all.filter((a) => a.isBookable);
        setBookableAssets(bookable);
        if (!preselectAssetId && bookable.length > 0) setAssetId(bookable[0].id);
      })
      .catch((err) => setError(err?.response?.data?.message || "Failed to load resources"))
      .finally(() => setIsLoading(false));
  }, []);

  const loadBookings = useCallback(async () => {
    if (!assetId) return;
    try {
      setBookings(await bookingService.listBookings({ assetId }));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load bookings");
    }
  }, [assetId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const start = new Date(form.startTime);
      const end = new Date(form.endTime);
      if (end <= start) {
        setFormError("End time must be after the start time");
        setIsSubmitting(false);
        return;
      }
      await bookingService.createBooking({
        assetId,
        purpose: form.purpose || undefined,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      });
      setShowForm(false);
      setForm(emptyForm);
      loadBookings();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel(id: string) {
    if (!window.confirm("Cancel this booking?")) return;
    setBusyId(id);
    try {
      await bookingService.cancelBooking(id);
      loadBookings();
    } finally {
      setBusyId(null);
    }
  }

  function startReschedule(b: Booking) {
    setReschedulingId(b.id);
    setRescheduleError(null);
    setRescheduleForm({
      startTime: toLocalInputValue(new Date(b.startTime)),
      endTime: toLocalInputValue(new Date(b.endTime)),
    });
  }

  async function handleReschedule(id: string) {
    setRescheduleError(null);
    setBusyId(id);
    try {
      const start = new Date(rescheduleForm.startTime);
      const end = new Date(rescheduleForm.endTime);
      if (end <= start) {
        setRescheduleError("End time must be after the start time");
        setBusyId(null);
        return;
      }
      await bookingService.rescheduleBooking(
        id,
        new Date(rescheduleForm.startTime).toISOString(),
        new Date(rescheduleForm.endTime).toISOString()
      );
      setReschedulingId(null);
      loadBookings();
    } catch (err: any) {
      setRescheduleError(err?.response?.data?.message || "Failed to reschedule");
    } finally {
      setBusyId(null);
    }
  }

  const selectedAsset = bookableAssets.find((a) => a.id === assetId);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Resource Booking</h1>
          <p className="text-sm text-gray-500">Time-slot booking of shared resources with no overlaps.</p>
        </div>
        {assetId && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            {showForm ? "Cancel" : "Book Resource"}
          </button>
        )}
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Resource</label>
            <select
              value={assetId}
              onChange={(e) => {
                setAssetId(e.target.value);
                setShowForm(false);
              }}
              className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {bookableAssets.length === 0 && <option value="">No bookable resources yet</option>}
              {bookableAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} — {a.name}
                </option>
              ))}
            </select>
          </div>

          {showForm && selectedAsset && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-md border border-gray-200 bg-gray-50 p-4"
            >
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Purpose</label>
                <input
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="Team standup, client demo..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Start</label>
                <input
                  type="datetime-local"
                  required
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">End</label>
                <input
                  type="datetime-local"
                  required
                  min={form.startTime}
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              {formError && <p className="sm:col-span-2 text-sm text-red-600">{formError}</p>}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {bookings.map((b) => {
              const isBusy = busyId === b.id;
              const isOwner = b.bookedById === user?.id;
              const canModify =
                isOwner || user?.role === "ADMIN" || user?.role === "ASSET_MANAGER" || user?.role === "DEPARTMENT_HEAD";
              const soon = b.status === "UPCOMING" ? startsInLabel(b.startTime) : null;
              const isRescheduling = reschedulingId === b.id;

              return (
                <div key={b.id} className="rounded-md border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CalendarClock size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(b.startTime).toLocaleString()} — {new Date(b.endTime).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {b.bookedBy.name}
                          {b.purpose ? ` · ${b.purpose}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {soon && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          <Clock size={11} /> {soon}
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[b.status]}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>

                  {canModify && (b.status === "UPCOMING" || b.status === "ONGOING") && (
                    <div className="mt-3 flex gap-3 border-t border-gray-100 pt-3">
                      {b.status === "UPCOMING" && (
                        <button
                          disabled={isBusy}
                          onClick={() => startReschedule(b)}
                          className="text-xs font-medium text-gray-600 hover:underline disabled:opacity-50"
                        >
                          Reschedule
                        </button>
                      )}
                      <button
                        disabled={isBusy}
                        onClick={() => handleCancel(b.id)}
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {isRescheduling && (
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                      <input
                        type="datetime-local"
                        value={rescheduleForm.startTime}
                        onChange={(e) => setRescheduleForm({ ...rescheduleForm, startTime: e.target.value })}
                        className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                      />
                      <input
                        type="datetime-local"
                        value={rescheduleForm.endTime}
                        min={rescheduleForm.startTime}
                        onChange={(e) => setRescheduleForm({ ...rescheduleForm, endTime: e.target.value })}
                        className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                      />
                      {rescheduleError && <p className="col-span-2 text-xs text-red-600">{rescheduleError}</p>}
                      <div className="col-span-2 flex gap-2">
                        <button
                          disabled={isBusy}
                          onClick={() => handleReschedule(b.id)}
                          className="rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setReschedulingId(null)}
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {bookings.length === 0 && assetId && (
              <p className="rounded-md border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
                No bookings yet for this resource.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
