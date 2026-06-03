import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useDashboardStore } from '../store/dashboardStore';
import type { Announcement } from '../types/announcement';

export const useRealtimeAnnouncements = (
  onNewAnnouncement?: (announcement: Announcement) => void
) => {
  const { addRealtimeAnnouncement, setConnectionStatus } = useDashboardStore();
  const onNewAnnouncementRef = useRef(onNewAnnouncement);

  // Keep callback ref updated to avoid re-triggering subscription
  useEffect(() => {
    onNewAnnouncementRef.current = onNewAnnouncement;
  }, [onNewAnnouncement]);

  useEffect(() => {
    setConnectionStatus('connecting');

    const channel = supabase
      .channel('corporate_announcements_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'corporate_announcements',
        },
        (payload) => {
          const newRow = payload.new as Announcement;
          
          // Verify that newRow exists and has proper attributes
          if (newRow && (newRow.source === 'NSE' || newRow.source === 'BSE')) {
            addRealtimeAnnouncement(newRow);
            if (onNewAnnouncementRef.current) {
              onNewAnnouncementRef.current(newRow);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnectionStatus('disconnected');
          // Reconnection is handled automatically by Supabase client
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addRealtimeAnnouncement, setConnectionStatus]);
};
