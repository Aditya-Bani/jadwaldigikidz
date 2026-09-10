import { useEffect, useId } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Keep a dataset live without a manual page refresh.
 *
 * Subscribes to Postgres change events for `table` and calls `refetch` on any
 * insert/update/delete, from any client. Also refetches when the tab becomes
 * visible again, because realtime sockets are dropped while a laptop or phone
 * sleeps and missed events are never replayed.
 */
export function useRealtimeRefetch(
  table: string,
  refetch: () => void,
  channelSuffix = '',
) {
  const instanceId = useId();

  useEffect(() => {
    const onChange = () => refetch();

    const channel = supabase
      .channel(`rt-${table}-${channelSuffix}-${instanceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        onChange,
      )
      .subscribe();

    const onVisible = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [table, channelSuffix, instanceId, refetch]);
}
