import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { productLocalName } from '../../lib/i18n';
import { getProductViews } from '../../lib/productViews';
import { formatMoney, productCurrency } from '../../lib/currency';
import { useFlashCountdown } from '../../lib/flash';
import FlashBolt from '../flash/FlashBolt';

function pct(was, now) {
  const w = Number(was);
  const n = Number(now);
  if (!w || !n || n >= w) return null;
  return Math.round(((w - n) / w) * 100);
}

export default function ProductCard({ product }) {
  const { lang } = useLang();
  const views = getProductViews(product);
  const thumbnail = views[0]?.url;
  const hover = views[1]?.url || thumbnail;
  const countdown = useFlashCountdown(product.flash_deal);
  const flash = countdown && !countdown.done ? product.flash_deal : null;
  const off = flash ? flash.percent_off : pct(product.was_price, product.price);
  const shownPrice = flash ? flash.price : product.price;
  const struckPrice = flash ? flash.regular_price : product.was_price;
  const currency = productCurrency(product);
  const localName = productLocalName(product, lang);
  const amharic = lang !== 'or';

  return (
    <Link
      to={product.slug ? `/products/${product.slug}` : `/product/${product.id}`}
      className="group block no-underline"
    >
      <div className="relative aspect-square bg-[#f4f4f4] overflow-hidden">
        {thumbnail ? (
          <>
            <img
              src={thumbnail}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain p-[8%] mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0"
            />
            <img
              src={hover}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain p-[8%] mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            No Image
          </div>
        )}

        {flash ? (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-gradient-to-r from-sale to-orange-500 text-white text-[11px] font-extrabold px-2 py-0.5 uppercase tracking-wide motion-safe:animate-flash-pop">
            <FlashBolt size={12} /> Flash -{off}%
          </span>
        ) : (
          off != null && (
            <span className="absolute top-2 left-2 bg-sale text-white text-[11px] font-bold px-2 py-0.5 uppercase tracking-wide">
              {off}% off
            </span>
          )
        )}
        {!product.in_stock && (
          <span className="absolute top-2 right-2 bg-black/80 text-white text-[11px] font-medium px-2 py-0.5">
            Sold Out
          </span>
        )}
      </div>

      <div className="pt-3 pb-1">
        {product.brand && (
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink">
            {product.brand}
          </p>
        )}
        <h3 className="text-sm text-ink-soft line-clamp-2 mt-0.5 group-hover:underline">
          {product.name}
        </h3>
        {localName && (
          <p
            className={`text-xs text-ink-muted line-clamp-1 ${
              amharic ? 'font-amharic' : ''
            }`}
          >
            {localName}
          </p>
        )}
        {product.color_name && (
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
            {product.color_name}
          </p>
        )}

        <div className="flex items-baseline gap-2 mt-1.5">
          {shownPrice != null && (
            <span className={`text-sm font-bold ${off != null ? 'text-sale' : 'text-ink'}`}>
              {formatMoney(shownPrice, currency)}
            </span>
          )}
          {struckPrice != null && off != null && (
            <span className="text-xs text-ink-muted line-through">{formatMoney(struckPrice, currency)}</span>
          )}
        </div>
        {flash && (
          <p className="text-[11px] font-semibold text-sale mt-1 tabular-nums">
            Ends in {countdown.days > 0 ? `${countdown.days}d ${countdown.hours}h` : `${countdown.hours}h ${String(countdown.minutes).padStart(2, '0')}m ${String(countdown.seconds).padStart(2, '0')}s`}
          </p>
        )}

      </div>
    </Link>
  );
}
