import { useWatch } from 'react-hook-form';
import { Zap } from 'lucide-react';
import { endsAtLabel } from '../../lib/flash';

/** ISO time from the API -> value for <input type="datetime-local"> in the admin's own time zone. */
export function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

/** Form values -> API payload. An empty flash price removes the deal. */
export function flashPayload(data) {
  if (data.flash_price === '' || data.flash_price == null) {
    return { flash_price: null, flash_starts_at: null, flash_ends_at: null };
  }
  return {
    flash_price: Number(data.flash_price),
    flash_starts_at: data.flash_starts_at ? new Date(data.flash_starts_at).toISOString() : null,
    flash_ends_at: data.flash_ends_at ? new Date(data.flash_ends_at).toISOString() : null,
  };
}

function status(price, flashPrice, startsAt, endsAt) {
  if (flashPrice === '' || flashPrice == null) return null;
  if (!endsAt) return { tone: 'warn', text: 'Choose when the deal ends.' };
  const now = Date.now();
  const end = new Date(endsAt).getTime();
  const start = startsAt ? new Date(startsAt).getTime() : null;
  if (Number(price) > 0 && Number(flashPrice) >= Number(price)) {
    return { tone: 'warn', text: 'The flash price must be lower than the normal price.' };
  }
  if (end <= now) return { tone: 'muted', text: 'This deal has ended. Customers see the normal price.' };
  if (start && start > now) {
    return { tone: 'info', text: `Scheduled: starts ${endsAtLabel(start)}, ends ${endsAtLabel(end)}.` };
  }
  const off = Number(price) > 0 ? Math.round(((Number(price) - Number(flashPrice)) / Number(price)) * 100) : null;
  return {
    tone: 'live',
    text: `Live now${off ? ` (${off}% off)` : ''} — ends ${endsAtLabel(end)}.`,
  };
}

const TONES = {
  live: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  warn: 'bg-amber-50 text-amber-800 border-amber-200',
  muted: 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function FlashDealFields({ control, register, setValue, errors, inputClass }) {
  const [price, flashPrice, startsAt, endsAt] = useWatch({
    control,
    name: ['price', 'flash_price', 'flash_starts_at', 'flash_ends_at'],
  });
  const state = status(price, flashPrice, startsAt, endsAt);

  const endIn = (hours) => {
    const from = startsAt ? new Date(startsAt).getTime() : Date.now();
    setValue('flash_ends_at', toLocalInput(new Date(from + hours * 3600_000).toISOString()), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  const endTonight = () => {
    const d = new Date();
    d.setHours(23, 59, 0, 0);
    setValue('flash_ends_at', toLocalInput(d.toISOString()), { shouldDirty: true, shouldValidate: true });
  };
  const clear = () => {
    for (const field of ['flash_price', 'flash_starts_at', 'flash_ends_at']) {
      setValue(field, '', { shouldDirty: true, shouldValidate: true });
    }
  };

  const label = 'block text-xs font-semibold uppercase tracking-wider mb-1';
  return (
    <div className="border border-orange-200 bg-orange-50/40 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5">
            <Zap size={14} className="fill-orange-500 text-orange-500" /> Flash deal (optional)
          </p>
          <p className="text-xs text-ink-muted mt-0.5">
            A lower price for a limited time. It shows with a countdown on the home page and product page, and
            goes back to the normal price automatically when the time ends.
          </p>
        </div>
        {flashPrice !== '' && flashPrice != null && (
          <button type="button" onClick={clear} className="text-xs font-semibold text-sale hover:underline shrink-0">
            Remove deal
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className={label}>Flash price</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className={errors.flash_price ? `${inputClass} border-sale` : inputClass}
            placeholder="e.g. 15000"
            {...register('flash_price', {
              validate: (value) =>
                value === '' ||
                value == null ||
                !(Number(price) > 0) ||
                Number(value) < Number(price) ||
                'Must be lower than the normal price',
            })}
          />
          {errors.flash_price && <p className="text-sale text-xs mt-1">{errors.flash_price.message}</p>}
        </div>
        <div>
          <label className={label}>Starts (empty = now)</label>
          <input type="datetime-local" className={inputClass} {...register('flash_starts_at')} />
        </div>
        <div>
          <label className={label}>Ends</label>
          <input
            type="datetime-local"
            className={errors.flash_ends_at ? `${inputClass} border-sale` : inputClass}
            {...register('flash_ends_at', {
              validate: (value, values) => {
                if (values.flash_price === '' || values.flash_price == null) return true;
                if (!value) return 'Choose when the deal ends';
                if (values.flash_starts_at && new Date(value) <= new Date(values.flash_starts_at)) {
                  return 'Must be after the start';
                }
                return true;
              },
            })}
          />
          {errors.flash_ends_at && <p className="text-sale text-xs mt-1">{errors.flash_ends_at.message}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-muted">Quick end time:</span>
        {[
          ['6 hours', () => endIn(6)],
          ['24 hours', () => endIn(24)],
          ['3 days', () => endIn(72)],
          ['Tonight 11:59 PM', endTonight],
        ].map(([text, onClick]) => (
          <button
            key={text}
            type="button"
            onClick={onClick}
            className="border border-gray-300 bg-white px-2 py-1 text-xs hover:border-ink"
          >
            {text}
          </button>
        ))}
      </div>

      {state && <p className={`border px-3 py-2 text-xs ${TONES[state.tone]}`}>{state.text}</p>}
    </div>
  );
}
