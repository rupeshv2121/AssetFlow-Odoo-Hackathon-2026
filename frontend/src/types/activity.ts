export interface NotificationItem {
  id: string;
  userId: string;
  type:
    | "ASSET_ASSIGNED"
    | "MAINTENANCE_APPROVED"
    | "MAINTENANCE_REJECTED"
    | "BOOKING_CONFIRMED"
    | "BOOKING_CANCELLED"
    | "BOOKING_REMINDER"
    | "TRANSFER_APPROVED"
    | "OVERDUE_RETURN"
    | "AUDIT_DISCREPANCY";
  message: string;
  isRead: boolean;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: string;
    department: { id: string; name: string } | null;
  } | null;
}

export interface ActivityData {
  scope: "organization" | "department" | "personal";
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  unreadNotificationCount: number;
}