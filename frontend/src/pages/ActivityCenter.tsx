import { useEffect, useState } from "react";
import { Bell, CheckCheck, ClipboardList, Download, Filter, RefreshCw } from "lucide-react";
import { useLocation } from "react-router-dom";
import * as activityService from "@/services/activityService";
import { downloadCsv } from "@/utils/csv";
import { ActivityData, AuditLogItem, NotificationItem } from "@/types/activity";

const NOTIFICATION_LABELS: Record<NotificationItem["type"], string> = {
  ASSET_ASSIGNED: "Asset Assigned",
  MAINTENANCE_APPROVED: "Maintenance Approved",
  MAINTENANCE_REJECTED: "Maintenance Rejected",
  BOOKING_CONFIRMED: "Booking Confirmed",
  BOOKING_CANCELLED: "Booking Cancelled",
  BOOKING_REMINDER: "Booking Reminder",
  TRANSFER_APPROVED: "Transfer Approved",
  OVERDUE_RETURN: "Overdue Return",
  AUDIT_DISCREPANCY: "Audit Discrepancy",
};

const notificationTone: Record<NotificationItem["type"], string> = {
  ASSET_ASSIGNED: "bg-sky-100 text-sky-700",
  MAINTENANCE_APPROVED: "bg-emerald-100 text-emerald-700",
  MAINTENANCE_REJECTED: "bg-rose-100 text-rose-700",
  BOOKING_CONFIRMED: "bg-violet-100 text-violet-700",
  BOOKING_CANCELLED: "bg-gray-100 text-gray-700",
  BOOKING_REMINDER: "bg-amber-100 text-amber-700",
  TRANSFER_APPROVED: "bg-indigo-100 text-indigo-700",
  OVERDUE_RETURN: "bg-red-100 text-red-700",
  AUDIT_DISCREPANCY: "bg-orange-100 text-orange-700",
};

const auditVerbTone: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-sky-100 text-sky-700",
  APPROVE: "bg-indigo-100 text-indigo-700",
  REJECT: "bg-rose-100 text-rose-700",
  DELETE: "bg-gray-100 text-gray-700",
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function describeMetadata(metadata: Record<string, unknown> | null) {
  if (!metadata) return "";
  const entries = Object.entries(metadata).slice(0, 3);
  return entries
    .map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join(" • ");
}

function Section({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: typeof Bell;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <Icon size={18} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="py-10 text-center text-sm text-gray-400">{children}</div>;
}

export default function ActivityCenter() {
  const location = useLocation();
  const [data, setData] = useState<ActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [visibleNotifications, setVisibleNotifications] = useState(5);
  const [visibleAuditLogs, setVisibleAuditLogs] = useState(5);

  const activeTab = location.pathname.includes("audit") ? "audit" : "notifications";

  const load = () => {
    setIsLoading(true);
    setError(null);
    activityService
      .getActivityCenter()
      .then(setData)
      .catch((err) => setError(err?.response?.data?.message || "Failed to load activity center"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const notifications = data?.notifications ?? [];
  const auditLogs = data?.auditLogs ?? [];
  const unreadCount = data?.unreadNotificationCount ?? 0;

  const notificationExportRows = notifications.map((notification) => ({
    ...notification,
    typeLabel: NOTIFICATION_LABELS[notification.type],
  }));
  const auditExportRows = auditLogs.map((log) => ({
    ...log,
    actorName: log.user?.name ?? "System",
    actorRole: log.user?.role ?? "SYSTEM",
    actorDepartment: log.user?.department?.name ?? "",
  }));

  const markOneRead = async (notificationId: string) => {
    setBusyId(notificationId);
    try {
      const updated = await activityService.markNotificationRead(notificationId);
      setData((current) =>
        current
          ? {
              ...current,
              notifications: current.notifications.map((notification) =>
                notification.id === updated.id ? updated : notification
              ),
              unreadNotificationCount: Math.max(0, current.unreadNotificationCount - (updated.isRead ? 1 : 0)),
            }
          : current
      );
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    setBusyId("all");
    try {
      await activityService.markAllNotificationsRead();
      setData((current) =>
        current
          ? {
              ...current,
              notifications: current.notifications.map((notification) => ({ ...notification, isRead: true })),
              unreadNotificationCount: 0,
            }
          : current
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Activity Logs & Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Notifications keep users informed; audit logs show who did what, when.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading activity...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="text-xs uppercase tracking-wide text-gray-400">Unread Notifications</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{unreadCount}</div>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="text-xs uppercase tracking-wide text-gray-400">Notifications</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{notifications.length}</div>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="text-xs uppercase tracking-wide text-gray-400">Audit Events</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{auditLogs.length}</div>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <Section
              title={`Notifications${data.scope === "organization" ? "" : ` (${data.scope})`}`}
              icon={Bell}
              action={
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadCsv("notifications.csv", notificationExportRows)}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <Download size={12} /> CSV
                  </button>
                  <button
                    onClick={markAllRead}
                    disabled={busyId === "all" || unreadCount === 0}
                    className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCheck size={12} /> Mark all read
                  </button>
                </div>
              }
            >
              <div className="mb-3 flex flex-wrap gap-2 text-xs text-gray-500">
                {Object.entries(NOTIFICATION_LABELS).map(([type, label]) => (
                  <span key={type} className={`rounded-full px-2.5 py-1 ${notificationTone[type as NotificationItem["type"]]}`}>
                    {label}
                  </span>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Message</th>
                      <th className="px-4 py-3">When</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {notifications.slice(0, visibleNotifications).map((notification) => (
                      <tr key={notification.id} className={notification.isRead ? "bg-white" : "bg-sky-50/40"}>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${notificationTone[notification.type]}`}
                          >
                            {NOTIFICATION_LABELS[notification.type]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{notification.message}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDateTime(notification.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          {notification.isRead ? (
                            <span className="text-xs font-medium text-gray-400">Read</span>
                          ) : (
                            <button
                              onClick={() => markOneRead(notification.id)}
                              disabled={busyId === notification.id}
                              className="text-xs font-medium text-sky-600 hover:underline disabled:opacity-50"
                            >
                              Mark read
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {notifications.length === 0 && (
                      <tr>
                        <td colSpan={4}>
                          <EmptyState>No notifications yet. Activity will appear here as people use the system.</EmptyState>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {visibleNotifications < notifications.length && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setVisibleNotifications((prev) => prev + 5)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    View More
                  </button>
                </div>
              )}
            </Section>

            <Section
              title="Audit Log"
              icon={ClipboardList}
              action={
                <button
                  onClick={() => downloadCsv("audit-log.csv", auditExportRows)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Download size={12} /> CSV
                </button>
              }
            >
              <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                <Filter size={12} /> Visible to admins/asset managers organization-wide, department heads for their departments, and employees for their own actions.
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Who</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Entity</th>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-4 py-3">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {auditLogs.slice(0, visibleAuditLogs).map((log: AuditLogItem) => (
                      <tr key={log.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{log.user?.name || "System"}</div>
                          <div className="text-xs text-gray-400">
                            {log.user?.role || "SYSTEM"}
                            {log.user?.department ? ` • ${log.user.department.name}` : ""}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${auditVerbTone[log.action.split("_")[0]] || "bg-gray-100 text-gray-700"}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {log.entityType}
                          {log.entityId ? <div className="text-xs text-gray-400">{log.entityId}</div> : null}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{describeMetadata(log.metadata) || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDateTime(log.createdAt)}</td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5}>
                          <EmptyState>No audit events yet. User actions will show up here once they are recorded.</EmptyState>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {visibleAuditLogs < auditLogs.length && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setVisibleAuditLogs((prev) => prev + 5)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    View More
                  </button>
                </div>
              )}
            </Section>
          </div>

          <div className={`mt-6 grid grid-cols-1 gap-6 ${activeTab === "notifications" ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Notification examples supported</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                {Object.values(NOTIFICATION_LABELS).map((label) => (
                  <span key={label} className="rounded-full bg-gray-100 px-3 py-1">
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">What gets logged</h3>
              <p className="mt-3 text-sm text-gray-500">
                Create, approve, reject, reschedule, return, resolve, and assignment actions surface here as they are recorded in the existing audit log table.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}