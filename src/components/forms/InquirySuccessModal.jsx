import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Send, Star, X } from 'lucide-react';
import { api } from '../../lib/apiClient';
import { formatMoney } from '../../lib/currency';

/**
 * Shown after an inquiry is saved: confirms it was recorded, offers Telegram
 * updates, and asks for an optional rating + comment about the experience.
 */
export default function InquirySuccessModal({ inquiry, d, amharic, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [allowPublic, setAllowPublic] = useState(false);
  const [state, setState] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');
  const closeRef = useRef(null);
  const local = amharic ? 'font-amharic' : '';

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function sendFeedback() {
    if (!rating) {
      setError('Please choose 1 to 5 stars.');
      return;
    }
    setState('sending');
    setError('');
    try {
      await api.post(`/inquiries/${inquiry.id}/feedback`, {
        rating,
        comment: comment.trim() || null,
        allow_public: allowPublic,
      });
      setState('done');
    } catch (err) {
      setError(err.message || 'Could not send feedback. Please try again.');
      setState('idle');
    }
  }

  const shown = hover || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="inquiry-success-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <button ref={closeRef} onClick={onClose} className="absolute right-3 top-3 p-1 hover:bg-gray-100" aria-label="Close">
          <X size={18} />
        </button>

        <div className="p-6 text-center border-b border-gray-100">
          <CheckCircle2 size={44} className="mx-auto text-emerald-600" />
          <h2 id="inquiry-success-title" className="mt-3 text-lg font-bold text-ink">
            Your inquiry has been recorded
          </h2>
          <p className={`text-base text-ink ${local}`}>{d.inquiryRecorded}</p>
          <p className="mt-2 text-sm text-ink-soft">
            We&apos;ll contact you soon by phone or Telegram.
            <span className={`block ${local}`}>{d.weWillContact}</span>
          </p>

          <div className="mt-4 bg-gray-50 px-4 py-3 text-left text-sm">
            <p className="font-semibold text-ink">{inquiry.product_name}</p>
            {inquiry.selected_size && <p className="text-ink-soft">Size {inquiry.selected_size}</p>}
            {inquiry.promo_code && inquiry.attribution_source === 'code' && (
              <p className="text-emerald-700">
                Promo {inquiry.promo_code}
                {inquiry.quoted_price != null && ` · your price ${formatMoney(inquiry.quoted_price, inquiry.currency || 'ETB')}`}
              </p>
            )}
          </div>

          {inquiry.telegram_updates_url && (
            <a
              href={inquiry.telegram_updates_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-[#229ED9] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:opacity-90"
            >
              <Send size={13} /> Get updates on Telegram · <span className={local}>{d.telegramUpdates}</span>
            </a>
          )}
        </div>

        <div className="p-6">
          {state === 'done' ? (
            <div className="text-center">
              <p className="font-semibold text-ink">Thank you for your feedback!</p>
              <p className={`text-ink-soft ${local}`}>{d.thanksFeedback}</p>
              <button onClick={onClose} className="mt-4 bg-ink text-white px-6 py-2 text-xs font-bold uppercase tracking-wider">
                Close
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-ink">
                How was your experience? <span className="font-normal text-ink-muted">(optional)</span>
              </p>
              <p className={`text-sm text-ink-soft ${local}`}>{d.rateExperience}</p>

              <div className="mt-3 flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => {
                      setRating(n);
                      setError('');
                    }}
                    className="p-1"
                  >
                    <Star size={30} className={n <= shown ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                  </button>
                ))}
              </div>

              <label className="mt-3 block text-xs font-semibold uppercase tracking-wider text-ink">
                Comment · <span className={local}>{d.yourComment}</span>
              </label>
              <textarea
                rows={3}
                maxLength={2000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1 w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink focus:border-ink"
                placeholder="Was it easy to find what you wanted?"
              />

              <label className="mt-2 flex items-start gap-2 text-xs text-ink-soft">
                <input type="checkbox" checked={allowPublic} onChange={(e) => setAllowPublic(e.target.checked)} className="mt-0.5" />
                <span>
                  You may show my review on the website (first name only).
                  <span className={`block ${local}`}>{d.allowPublic}</span>
                </span>
              </label>

              {error && <p className="mt-2 text-xs text-sale">{error}</p>}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={sendFeedback}
                  disabled={state === 'sending'}
                  className="flex-1 bg-ink text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {state === 'sending' ? 'Sending…' : <>Send · <span className={local}>{d.submitFeedback}</span></>}
                </button>
                <button onClick={onClose} className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider border border-gray-300 hover:bg-gray-50">
                  No thanks · <span className={local}>{d.noThanks}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
