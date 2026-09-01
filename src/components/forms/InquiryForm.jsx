import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/apiClient';
import { dict } from '../../lib/i18n';
import { useLang } from '../../context/LanguageContext';

export default function InquiryForm({ product }) {
  const [submitting, setSubmitting] = useState(false);
  const { lang } = useLang();
  const d = dict(lang);
  const amharic = lang !== 'or';
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const base =
    'w-full border rounded-none px-3 py-2 text-sm focus:outline-none focus:ring-1';
  const inputClass = `${base} border-gray-300 focus:ring-ink focus:border-ink`;
  const errorInputClass = `${base} border-sale focus:ring-sale focus:border-sale`;

  async function onSubmit(data) {
    setSubmitting(true);
    try {
      await api.post('/inquiries', {
        product_id: product.id,
        full_name: data.full_name,
        phone: data.phone,
        telegram: data.telegram,
        message: data.message || null,
      });
      toast.success(
        amharic
          ? `Thank you! We'll contact you soon. · እናመሰግናለን!`
          : `Thank you! We'll contact you soon. · Galatoomaa!`
      );
      reset();
    } catch {
      toast.error('Failed to submit inquiry. Please try again.');
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
            placeholder="Size, color, quantity, or any question…"
            {...register('message')}
          />
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
    </div>
  );
}
