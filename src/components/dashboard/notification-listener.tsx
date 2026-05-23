'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getNotifications, markAsRead } from '@/app/dashboard/actions-notification';

export function NotificationListener() {
  const router = useRouter();
  const { push } = router;

  const notifiedIds = useRef<Set<number>>(new Set());
  const tabOpenTime = useRef<number>(0);
  const isRequestingPermission = useRef<boolean>(false);

  // Request Notification permission and set open time on mount
  useEffect(() => {
    tabOpenTime.current = Date.now();

    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'default' && !isRequestingPermission.current) {
      isRequestingPermission.current = true;
      Notification.requestPermission().then(() => {
        isRequestingPermission.current = false;
      });
    }
  }, []);

  // Poll for new notifications
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const checkNewNotifications = async () => {
      if (Notification.permission !== 'granted') {
        return;
      }

      try {
        const notifications = await getNotifications();
        if (!notifications || notifications.length === 0) {
          return;
        }

        const newAlerts: typeof notifications = [];

        notifications.forEach((notif) => {
          const notifTime = new Date(notif.createdAt).getTime();
          const isNew = notifTime > tabOpenTime.current;
          const alreadyNotified = notifiedIds.current.has(notif.id);

          if (!notif.isRead && isNew && !alreadyNotified) {
            newAlerts.push(notif);
          }
        });

        if (newAlerts.length > 0) {
          // Update notified IDs set
          newAlerts.forEach((n) => notifiedIds.current.add(n.id));

          // Trigger native notifications
          newAlerts.forEach((notif) => {
            const n = new Notification(notif.title, {
              body: notif.message,
              icon: '/favicon.ico', // Fallback standard icon
              tag: `notif-${notif.id}`,
            });

            n.onclick = async () => {
              window.focus();
              try {
                await markAsRead(notif.id);
              } catch (err) {
                console.error('Failed to mark notification as read on click:', err);
              }
              if (notif.link) {
                push(notif.link);
              }
              n.close();
            };
          });
        }
      } catch (error) {
        console.error('Notification polling failed:', error);
      }
    };

    // Run check immediately and then every 15 seconds
    checkNewNotifications();
    const interval = setInterval(checkNewNotifications, 15000);

    return () => clearInterval(interval);
  }, [push]);

  return null;
}
