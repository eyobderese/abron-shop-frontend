import { useEffect, useState } from 'react';

/**
 * Live countdown for a product's flash deal. Uses the server's `ends_in_seconds`
 * (not the phone's clock) so the timer is right even if the customer's clock is wrong.
 */
export function useFlashCountdown(deal) {
  const [endAt] = useState(() =>
    deal ? Date.now() + Number(deal.ends_in_seconds || 0) * 1000 : 0
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deal) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [deal]);

  if (!deal) return null;
  const total = Math.max(0, Math.floor((endAt - now) / 1000));
  const startedAt = deal.starts_at ? new Date(deal.starts_at).getTime() : null;
  const length = startedAt ? (new Date(deal.ends_at).getTime() - startedAt) / 1000 : null;
  return {
    total,
    done: total <= 0,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    /** 0–1 share of the deal time still left (for the draining bar), when the start is known. */
    remaining: length && length > 0 ? Math.min(1, total / length) : null,
    endsLabel: endsAtLabel(endAt),
  };
}

/** "today at 6:00 PM", "tomorrow at 9:00 AM" or "Mon, Nov 24 at 6:00 PM". */
export function endsAtLabel(timestamp) {
  const end = new Date(timestamp);
  const time = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (end.toDateString() === today.toDateString()) return `today at ${time}`;
  if (end.toDateString() === tomorrow.toDateString()) return `tomorrow at ${time}`;
  const day = end.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return `${day} at ${time}`;
}

export const pad = (n) => String(n).padStart(2, '0');
