import { getUnixTime } from 'date-fns';
import { useEffect, useState } from 'react';

function getCurrentTimestamp(): number {
  const forkSkipAhead = typeof window !== 'undefined' ? localStorage.getItem('forkTimeAhead') : null;
  const offset = forkSkipAhead ? Number(forkSkipAhead) : 0;
  return getUnixTime(new Date()) + offset;
}

export function useCurrentTimestamp(updateInterval = 15): number {
  const [timestamp, setTimestamp] = useState(getCurrentTimestamp());

  useEffect(() => {
    const intervalHandlerID = setInterval(() => setTimestamp(getCurrentTimestamp()), 1000 * updateInterval);
    return () => clearInterval(intervalHandlerID);
  }, [updateInterval]);

  return timestamp;
}
