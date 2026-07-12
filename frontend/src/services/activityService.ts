import { apiClient } from "@/services/apiClient";
import { ActivityData, NotificationItem } from "@/types/activity";

export async function getActivityCenter(): Promise<ActivityData> {
  const { data } = await apiClient.get<ActivityData>("/activity");
  return data;
}

export async function markNotificationRead(notificationId: string): Promise<NotificationItem> {
  const { data } = await apiClient.patch<{ notification: NotificationItem }>(`/activity/notifications/${notificationId}/read`);
  return data.notification;
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch("/activity/notifications/read-all");
}