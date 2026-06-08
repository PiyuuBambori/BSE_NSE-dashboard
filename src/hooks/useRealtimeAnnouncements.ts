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
          table: 'bse_nse',
        },
        (payload) => {
          const newRow = payload.new as Announcement;

          if (newRow && newRow.source && newRow.headline) {
            addRealtimeAnnouncement(newRow);
            if (onNewAnnouncementRef.current) {
              onNewAnnouncementRef.current(newRow);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'news_channels',
        },
        (payload) => {
          const newRow = payload.new as any;

          if (newRow && newRow.source && newRow.headline) {
            const mappedRow: Announcement = {
              id: newRow.id,
              headline: newRow.headline,
              article_cleaned: newRow.article || '',
              url: newRow.url,
              tags: null,
              published_at: newRow.published_at,
              source: newRow.source,
            };
            addRealtimeAnnouncement(mappedRow);
            if (onNewAnnouncementRef.current) {
              onNewAnnouncementRef.current(mappedRow);
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
