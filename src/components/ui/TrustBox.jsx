import { Phone, ShieldCheck, Truck, Wallet } from 'lucide-react';
import { CONTACTS, DEPOSIT_PERCENT, DELIVERY_DAYS } from '../../lib/trust';

/** Shown next to the inquiry form so the buyer knows exactly what happens next. */
export default function TrustBox({ amharic }) {
  const rows = [
    {
      icon: Wallet,
      en: `Nothing to pay now. After we agree by phone, you pay ${DEPOSIT_PERCENT}% — the rest on delivery.`,
      am: `አሁን ምንም አይከፍሉም። በስልክ ከተስማማን በኋላ ${DEPOSIT_PERCENT}% ብቻ፤ ቀሪው ሲደርስዎ።`,
    },
    {
      icon: Truck,
      en: `Delivered in about ${DELIVERY_DAYS} days.`,
      am: `በ${DELIVERY_DAYS} ቀናት ውስጥ ይደርሳል።`,
    },
    {
      icon: ShieldCheck,
      en: 'Wrong size or damaged? It is on us.',
      am: 'መጠኑ ካልሆነ ወይም ከተበላሸ ኃላፊነቱ የእኛ ነው።',
    },
  ];
  return (
    <div className="border border-gray-200 bg-white p-5 mb-6">
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.en} className="flex gap-3">
            <row.icon size={20} className="text-sale shrink-0 mt-0.5" />
            <span className="text-sm text-ink leading-snug">
              {row.en}
              {amharic && <span className="block font-amharic text-xs text-ink-muted mt-0.5">{row.am}</span>}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <span className="text-ink-muted">Questions? Call us:</span>
        {CONTACTS.map((c) => (
          <a key={c.tel} href={`tel:${c.tel}`} className="inline-flex items-center gap-1 font-semibold text-ink no-underline hover:underline">
            <Phone size={13} /> {c.display} <span className="text-ink-muted font-normal">({c.label})</span>
          </a>
        ))}
      </div>
    </div>
  );
}
