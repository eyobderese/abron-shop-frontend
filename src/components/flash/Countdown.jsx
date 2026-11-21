import { pad } from '../../lib/flash';

/** One digit box; the key change re-mounts it so each new number slides in. */
function Unit({ value, label, dark }) {
  const text = pad(value);
  return (
    <span className="flex flex-col items-center">
      <span
        className={`relative overflow-hidden min-w-[2.4ch] text-center font-extrabold tabular-nums rounded-md px-1.5 py-1 ${
          dark ? 'bg-ink text-white' : 'bg-white text-sale'
        }`}
      >
        <span key={text} className="block motion-safe:animate-flash-tick">
          {text}
        </span>
      </span>
      <span className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${dark ? 'text-ink-muted' : 'text-white/80'}`}>
        {label}
      </span>
    </span>
  );
}

export default function Countdown({ countdown, dark = false, className = '' }) {
  if (!countdown) return null;
  const sep = <span className={`font-extrabold pb-3 ${dark ? 'text-ink' : 'text-white'}`}>:</span>;
  return (
    <span className={`inline-flex items-start gap-1 ${className}`} role="timer" aria-live="off">
      {countdown.days > 0 && (
        <>
          <Unit value={countdown.days} label="days" dark={dark} />
          {sep}
        </>
      )}
      <Unit value={countdown.hours} label="hrs" dark={dark} />
      {sep}
      <Unit value={countdown.minutes} label="min" dark={dark} />
      {sep}
      <Unit value={countdown.seconds} label="sec" dark={dark} />
    </span>
  );
}
