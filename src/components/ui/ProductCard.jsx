import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { productLocalName, catLocal } from '../../lib/i18n';
import { getProductViews } from '../../lib/productViews';
import { formatMoney, productCurrency } from '../../lib/currency';

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
  const off = pct(product.was_price, product.price);
  const currency = productCurrency(product);
  const cat = product.categories; // joined row (may be undefined)
  const localName = productLocalName(product, lang);
  const localCat = catLocal(cat, lang);
  const amharic = lang !== 'or';

  return (
    <Link
      to={product.slug ? `/products/${product.slug}` : `/product/${product.id}`}
      className="group block no-underline"
    >
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        {thumbnail ? (
          <>
            <img
              src={thumbnail}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
            />
            <img
              src={hover}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            No Image
          </div>
        )}

        {off != null && (
          <span className="absolute top-2 left-2 bg-sale text-white text-[11px] font-bold px-2 py-0.5 uppercase tracking-wide">
            {off}% off
          </span>
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

        <div className="flex items-baseline gap-2 mt-1.5">
          {product.price != null && (
            <span
              className={`text-sm font-bold ${off != null ? 'text-sale' : 'text-ink'}`}
            >
              {formatMoney(product.price, currency)}
            </span>
          )}
          {product.was_price != null && off != null && (
            <span className="text-xs text-ink-muted line-through">
              {formatMoney(product.was_price, currency)}
            </span>
          )}
        </div>

        {cat && (
          <p
            className={`text-[11px] text-ink-muted mt-1 ${
              amharic ? 'font-amharic' : ''
            }`}
          >
            {localCat ? `${cat.name_en} · ${localCat}` : cat.name_en}
          </p>
        )}
      </div>
    </Link>
  );
}
