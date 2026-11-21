import { useState } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { recentRetry, retryFailedRequests } from '../../lib/retry';

/**
 * Shown when data could not be loaded. Retry re-runs every failed request on the page
 * (including the menu and footer), and shows that it is working.
 */
export default function LoadError({
  title = 'Unable to load this page',
  message = 'Check your connection and try again.',
}) {
  const [retrying, setRetrying] = useState(false);
  const [previous] = useState(recentRetry);

  function retry() {
    setRetrying(true);
    // Keep the spinner visible briefly so the customer always sees the click registered,
    // even when the server answers (or fails) instantly.
    setTimeout(() => {
      retryFailedRequests();
      setRetrying(false);
    }, 700);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center" role="alert">
      <WifiOff size={32} className="mx-auto mb-4 text-ink-muted" />
      <h1 className="text-xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-muted">{message}</p>
      <button
        type="button"
        onClick={retry}
        disabled={retrying}
        aria-busy={retrying}
        className="mt-6 inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-black active:scale-95 transition disabled:opacity-60 disabled:cursor-wait"
      >
        <RefreshCw size={15} className={retrying ? 'animate-spin' : ''} />
        {retrying ? 'Retrying…' : 'Retry'}
      </button>
      {previous && !retrying && (
        <p className="mt-3 text-xs text-sale" aria-live="polite">
          Still can&apos;t connect · tried at {new Date(previous.last).toLocaleTimeString()}
          {previous.count > 1 && ` (attempt ${previous.count})`}
        </p>
      )}
      <p className="mt-3 text-xs text-ink-muted">
        We&apos;ll also try again automatically when your connection comes back.
      </p>
    </div>
  );
}
