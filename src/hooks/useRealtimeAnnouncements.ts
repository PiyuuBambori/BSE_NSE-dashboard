import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useDashboardStore } from '../store/dashboardStore';
import type { Announcement } from '../types/announcement';

export const useRealtimeAnnouncements = (
  onNewAnnouncement?: (announcement: Announcement) => void
) => {
  const { addRealtimeAnnouncement, setConnectionStatus } = useDashboardStore();
  const onNewAnnouncementRef = useRef(onNewAnnouncement);

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

          // Accept all sources — the store handles filter matching
          if (newRow && newRow.source && newRow.headline) {
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
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addRealtimeAnnouncement, setConnectionStatus]);
};
