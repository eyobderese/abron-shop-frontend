import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFlashDeals } from '../../hooks/useFlashDeals';
import { useFlashCountdown } from '../../lib/flash';
import { getProductViews } from '../../lib/productViews';
import { formatMoney, productCurrency } from '../../lib/currency';
import Countdown from './Countdown';
import FlashBolt from './FlashBolt';

function timeLeftText(c) {
  if (c.days > 0) return `${c.days}d ${c.hours}h left`;
  if (c.hours > 0) return `${c.hours}h ${c.minutes}m left`;
  return `${c.minutes}m ${c.seconds}s left`;
}

function FlashCard({ product, onEnded }) {
  const countdown = useFlashCountdown(product.flash_deal);
  const done = countdown?.done;
  useEffect(() => {
    if (done) onEnded(product.id);
  }, [done, onEnded, product.id]);
  if (!countdown || done) return null;

  const deal = product.flash_deal;
  const image = getProductViews(product)[0]?.url;
  const currency = productCurrency(product);
  const urgent = countdown.total < 3600;
  // Without a start time, show how much of the last 24 hours is left.
  const left = countdown.remaining ?? Math.min(1, countdown.total / 86400);

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group snap-start shrink-0 w-[46%] sm:w-[31%] lg:w-[19%] bg-white no-underline flex flex-col"
    >
      <div className="relative aspect-square bg-[#f4f4f4] overflow-hidden">
        {image && (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain p-[8%] mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {deal.percent_off != null && (
          <span className="absolute top-2 left-2 bg-sale text-white text-xs font-extrabold px-2 py-1 motion-safe:animate-flash-pop">
            -{deal.percent_off}%
          </span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        {product.brand && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{product.brand}</p>
        )}
        <p className="text-sm text-ink line-clamp-1 group-hover:underline">{product.name}</p>
        <p className="mt-1.5 flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-extrabold text-sale">{formatMoney(deal.price, currency)}</span>
          {deal.regular_price != null && (
            <span className="text-xs text-ink-muted line-through">{formatMoney(deal.regular_price, currency)}</span>
          )}
        </p>
        <div className="mt-auto pt-3">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width] duration-1000 ${urgent ? 'bg-sale' : 'bg-gradient-to-r from-sale to-orange-500'}`}
              style={{ width: `${Math.max(4, left * 100)}%` }}
            />
          </div>
          <p className={`text-[11px] mt-1 font-semibold ${urgent ? 'text-sale' : 'text-ink-muted'}`}>
            {timeLeftText(countdown)}
          </p>
        </div>
      </div>
    </Link>
  );
}

/** Header countdown for the deal that ends first. */
function HeaderTimer({ product }) {
  const countdown = useFlashCountdown(product.flash_deal);
  if (!countdown) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs sm:text-sm text-white/90 text-right leading-tight">
        Ends <b className="text-white">{countdown.endsLabel}</b>
      </span>
      <Countdown countdown={countdown} />
    </div>
  );
}

export default function FlashDealsSection({ amharic }) {
  const { deals } = useFlashDeals();
  const [ended, setEnded] = useState(() => new Set());
  const [scroller, setScroller] = useState(null);
  const live = deals.filter((d) => !ended.has(d.id));
  if (live.length === 0) return null;

  const markEnded = (id) =>
    setEnded((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  const scrollBy = (dir) => scroller?.scrollBy({ left: dir * scroller.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10" aria-label="Flash deals">
      <div className="relative overflow-hidden bg-gradient-to-r from-sale via-red-600 to-orange-500 px-4 py-3 sm:px-5 flex flex-wrap items-center justify-between gap-3">
        {/* moving light */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent motion-safe:animate-flash-shine"
        />
        <div className="relative flex items-center gap-2">
          <FlashBolt size={26} />
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white leading-none">
              Flash Deals
            </h2>
            <p className={`text-xs text-white/85 mt-0.5 ${amharic ? 'font-amharic' : ''}`}>
              {amharic ? 'ፈጣን ቅናሽ — ጊዜው ሳያልቅ ይዘዙ' : "Hir'isa yeroo gabaabaa — osoo yeroon hin darbin ajajaa"}
            </p>
          </div>
        </div>
        <div className="relative">
          <HeaderTimer key={live[0].id} product={live[0]} />
        </div>
      </div>

      <div className="relative bg-gray-100 p-3 sm:p-4">
        <div
          ref={setScroller}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {live.map((product) => (
            <FlashCard key={product.id} product={product} onEnded={markEnded} />
          ))}
        </div>
        {live.length > 5 && (
          <>
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Previous deals"
              className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-white shadow-cardHover rounded-full"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="More deals"
              className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-white shadow-cardHover rounded-full"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
