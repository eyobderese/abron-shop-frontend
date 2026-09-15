import { RefreshCw, WifiOff } from 'lucide-react';

export default function LoadError({
  title = 'Unable to load this page',
  message = 'Check your connection and try again.',
  onRetry,
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center" role="alert">
      <WifiOff size={32} className="mx-auto mb-4 text-ink-muted" />
      <h1 className="text-xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-black"
        >
          <RefreshCw size={15} /> Retry
        </button>
      )}
    </div>
  );
}
