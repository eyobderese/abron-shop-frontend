import { useFlashCountdown } from '../../lib/flash';
import { formatMoney, productCurrency } from '../../lib/currency';
import Countdown from './Countdown';
import FlashBolt from './FlashBolt';

function pct(was, now) {
  const w = Number(was);
  const n = Number(now);
  if (!w || !n || n >= w) return null;
  return Math.round(((w - n) / w) * 100);
}

/**
 * Price on the product page. While a flash deal runs it shows the deal banner with a
 * live countdown; when the timer reaches zero it switches back to the normal price.
 * Render it with key={product.id} so the timer restarts for each product.
 */
export default function ProductPrice({ product, amharic }) {
  const countdown = useFlashCountdown(product.flash_deal);
  const currency = productCurrency(product);
  const flash = countdown && !countdown.done ? product.flash_deal : null;

  if (flash) {
    return (
      <div className="mb-4">
        <div className="relative overflow-hidden bg-gradient-to-r from-sale via-red-600 to-orange-500 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent motion-safe:animate-flash-shine"
          />
          <div className="relative flex items-center gap-2 text-white">
            <FlashBolt size={22} />
            <div className="leading-tight">
              <p className="font-extrabold uppercase tracking-wide">Flash deal</p>
              <p className="text-xs text-white/90">
                Ends <b className="text-white">{countdown.endsLabel}</b>
                {amharic && <span className="font-amharic"> · ቅናሹ ሳያልቅ ይዘዙ</span>}
              </p>
            </div>
          </div>
          <Countdown countdown={countdown} className="relative" />
        </div>
        <div className="flex items-baseline gap-3 flex-wrap border border-t-0 border-gray-200 px-4 py-3">
          <span className="text-3xl font-extrabold text-sale">{formatMoney(flash.price, currency)}</span>
          {flash.regular_price != null && (
            <span className="text-base text-ink-muted line-through">{formatMoney(flash.regular_price, currency)}</span>
          )}
          {flash.percent_off != null && (
            <span className="bg-sale text-white text-xs font-bold px-2 py-0.5 uppercase">
              Save {flash.percent_off}%
            </span>
          )}
          <p className="basis-full text-xs text-ink-muted">
            Send your inquiry before the timer ends to get this price.
          </p>
        </div>
      </div>
    );
  }

  const off = pct(product.was_price, product.price);
  return (
    <div className="flex items-baseline gap-3 mb-4">
      {product.price != null && (
        <span className={`text-2xl font-bold ${off != null ? 'text-sale' : 'text-ink'}`}>
          {formatMoney(product.price, currency)}
        </span>
      )}
      {product.was_price != null && off != null && (
        <>
          <span className="text-base text-ink-muted line-through">{formatMoney(product.was_price, currency)}</span>
          <span className="bg-sale text-white text-xs font-bold px-2 py-0.5 uppercase">{off}% off</span>
        </>
      )}
    </div>
  );
}
