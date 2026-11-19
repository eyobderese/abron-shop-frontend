import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Send, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/apiClient';
import { dict } from '../../lib/i18n';
import { useLang } from '../../context/LanguageContext';
import { formatMoney } from '../../lib/currency';
import { getStoredPromo, normalizePromo } from '../../lib/promo';

export default function InquiryForm({ product, selectedSize = '' }) {
  const [submitting, setSubmitting] = useState(false);
  const [promoInput, setPromoInput] = useState(() => getStoredPromo());
  const [promo, setPromo] = useState(null); // validated preview: { code, quoted_price, ... }
  const [promoError, setPromoError] = useState('');
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [telegramUrl, setTelegramUrl] = useState(null);
  const { lang } = useLang();
  const d = dict(lang);
  const amharic = lang !== 'or';
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];

  const base =
    'w-full border rounded-none px-3 py-2 text-sm focus:outline-none focus:ring-1';
  const inputClass = `${base} border-gray-300 focus:ring-ink focus:border-ink`;
  const errorInputClass = `${base} border-sale focus:ring-sale focus:border-sale`;

  async function applyPromo() {
    const code = normalizePromo(promoInput);
    setPromoError('');
    setPromo(null);
    if (!code) return null;
    setCheckingPromo(true);
    try {
      const result = await api.post('/promo-codes/validate', {
        code,
        product_id: product.id,
      });
      if (!result.valid) {
        setPromoError(result.message || 'This promo code is not valid');
        return false;
      }
      setPromo(result);
      return result;
    } catch (err) {
      setPromoError(err.message || 'Could not check the code');
      return false;
    } finally {
      setCheckingPromo(false);
    }
  }

  function clearPromo() {
    setPromoInput('');
    setPromo(null);
    setPromoError('');
  }

  async function onSubmit(data) {
    if (sizes.length > 0 && !sizes.includes(selectedSize)) {
      toast.error('Please select an available size above.');
      return;
    }
    const code = normalizePromo(promoInput);
    if (code && promo?.code !== code) {
      // Typed but not applied yet: check it now so the customer sees the price they get.
      const ok = await applyPromo();
      if (!ok) return;
    }
    setSubmitting(true);
    try {
      const created = await api.post('/inquiries', {
        product_id: product.id,
        full_name: data.full_name,
        phone: data.phone,
        telegram: data.telegram,
        selected_size: selectedSize || null,
        message: data.message || null,
        promo_code: code || null,
      });
      setTelegramUrl(created?.telegram_updates_url || null);
      toast.success(
        amharic
          ? `Thank you! We'll contact you soon. · እናመሰግናለን!`
          : `Thank you! We'll contact you soon. · Galatoomaa!`
      );
      reset();
    } catch (err) {
      toast.error(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-ink mb-1">
        Express Interest · {d.expressInterest}
      </h2>
      <p className="text-xs text-ink-muted mb-5">
        We don&apos;t do online checkout — share your contact and we&apos;ll reach out
        personally to finalize the order.{' '}
        <span className={amharic ? 'font-amharic' : ''}>
          {amharic
            ? 'ሙሉ ስምዎን እና አድራሻዎን ይተዉልን።'
            : 'Maqaa fi teessoo keessan nuuf dhiisaa.'}
        </span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {product.color_name && (
          <div className="border border-gray-200 bg-white px-3 py-2 text-sm text-ink">
            <span className="font-semibold">Selected color:</span>{' '}
            {product.color_name}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
            Full Name · {d.fullName} *
          </label>
          <input
            type="text"
            className={errors.full_name ? errorInputClass : inputClass}
            placeholder="Your full name"
            {...register('full_name', { required: 'Full name is required' })}
          />
          {errors.full_name && (
            <p className="text-sale text-xs mt-1">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
            Phone · {d.phone} *
          </label>
          <input
            type="text"
            className={errors.phone ? errorInputClass : inputClass}
            placeholder="+251 9XX XXX XXX"
            {...register('phone', { required: 'Phone number is required' })}
          />
          {errors.phone && (
            <p className="text-sale text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
            Telegram · {d.telegram} *
          </label>
          <input
            type="text"
            className={errors.telegram ? errorInputClass : inputClass}
            placeholder="@yourusername"
            {...register('telegram', {
              required: 'Telegram username is required',
            })}
          />
          {errors.telegram && (
            <p className="text-sale text-xs mt-1">{errors.telegram.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
            Message · {d.message}
          </label>
          <textarea
            className={inputClass}
            rows={3}
            placeholder="Color, quantity, or any question…"
            {...register('message')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
            Promo Code · <span className={amharic ? 'font-amharic' : ''}>{d.promoCode}</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
              />
              <input
                type="text"
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value.toUpperCase());
                  setPromo(null);
                  setPromoError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyPromo();
                  }
                }}
                className={`${promoError ? errorInputClass : inputClass} pl-8 uppercase`}
                placeholder="Optional"
                maxLength={30}
                autoComplete="off"
              />
            </div>
            {promo ? (
              <button
                type="button"
                onClick={clearPromo}
                className="border border-gray-300 px-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-100"
                aria-label="Remove promo code"
              >
                <X size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={applyPromo}
                disabled={!promoInput.trim() || checkingPromo}
                className="border border-ink px-4 text-xs font-bold uppercase tracking-wider hover:bg-ink hover:text-white transition-colors disabled:opacity-40"
              >
                {checkingPromo ? '…' : <>Apply · <span className={amharic ? 'font-amharic' : ''}>{d.apply}</span></>}
              </button>
            )}
          </div>
          {promoError && <p className="text-sale text-xs mt-1">{promoError}</p>}
          {promo && (
            <div className="mt-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
              <p className="font-semibold text-emerald-800">
                {promo.code} applied — {promo.discount_label}
              </p>
              {promo.quoted_price != null ? (
                <p className="text-ink mt-0.5">
                  Your price · <span className={amharic ? 'font-amharic' : ''}>{d.yourPrice}</span>:{' '}
                  <span className="line-through text-ink-muted mr-1">
                    {formatMoney(promo.list_price, promo.currency)}
                  </span>
                  <span className="font-bold text-sale">
                    {formatMoney(promo.quoted_price, promo.currency)}
                  </span>
                </p>
              ) : (
                <p className="text-ink-soft mt-0.5">
                  The discount will be applied in your quote.
                </p>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink text-white px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send size={14} />
          {submitting ? 'Sending…' : `Send Inquiry · ${d.send}`}
        </button>
      </form>

      {telegramUrl && (
        <div className="mt-4 border border-sky-200 bg-sky-50 p-4 text-sm">
          <p className="font-semibold text-ink">Get updates about your order on Telegram</p>
          <p className="text-ink-soft text-xs mt-1">
            We&apos;ll message you when your order is confirmed — and you can confirm any
            change yourself.
          </p>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 bg-[#229ED9] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:opacity-90"
          >
            <Send size={13} /> Open Telegram ·{' '}
            <span className={amharic ? 'font-amharic' : ''}>{d.telegramUpdates}</span>
          </a>
        </div>
      )}
    </div>
  );
}
