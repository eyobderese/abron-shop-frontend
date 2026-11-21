import { useEffect } from 'react';

const RETRY_EVENT = 'abron:retry';

// Remembered across error screens so a new one can say "still can't connect (attempt 2)".
const attempts = { count: 0, last: 0 };

/** Ask every data hook that is currently failing to try again (Retry button). */
export function retryFailedRequests() {
  attempts.count += 1;
  attempts.last = Date.now();
  window.dispatchEvent(new Event(RETRY_EVENT));
}

/** The latest manual retry, if it happened in the last minute. */
export function recentRetry() {
  return attempts.last && Date.now() - attempts.last < 60_000 ? { ...attempts } : null;
}

/**
 * While `failed` is true, run `refetch` when the Retry button is pressed anywhere
 * or when the device comes back online. Healthy hooks are left alone.
 */
export function useRetryWhenFailed(failed, refetch) {
  useEffect(() => {
    if (!failed) return undefined;
    const handler = () => refetch();
    window.addEventListener(RETRY_EVENT, handler);
    window.addEventListener('online', handler);
    return () => {
      window.removeEventListener(RETRY_EVENT, handler);
      window.removeEventListener('online', handler);
    };
  }, [failed, refetch]);
}
