import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { dict } from '../../lib/i18n';
import { getProductViews, viewLabelText } from '../../lib/productViews';

export default function ImageGallery({ product, views: viewsProp, images }) {
  const { lang } = useLang();
  const d = dict(lang);

  const views =
    viewsProp ||
    (product ? getProductViews(product) : null) ||
    (Array.isArray(images)
      ? images.map((url, i) => ({ url, label: i === 0 ? 'front' : 'other' }))
      : []);

  const [current, setCurrent] = useState(0);
  const count = views.length;

  if (!count) {
    return (
      <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-300 text-2xl">
        No Images
      </div>
    );
  }

  const safeIndex = Math.min(current, count - 1);
  const active = views[safeIndex];

  function go(delta) {
    setCurrent((prev) => {
      const next = prev + delta;
      if (next < 0) return count - 1;
      if (next >= count) return 0;
      return next;
    });
  }

  return (
    <div>
      <div className="relative aspect-square bg-gray-100 overflow-hidden mb-3">
        <img
          key={active.url}
          src={active.url}
          alt={`${product?.name || 'Product'} — ${viewLabelText(active.label, lang, d)}`}
          className="w-full h-full object-cover"
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous view"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 shadow"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next view"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 shadow"
            >
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5">
              {safeIndex + 1} / {count}
            </span>
          </>
        )}

        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-medium px-2 py-0.5 uppercase tracking-wide">
          {viewLabelText(active.label, lang, d)}
        </span>
      </div>

      {count > 1 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2">
            {d.productViews}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {views.map((view, i) => {
              const label = viewLabelText(view.label, lang, d);
              const selected = i === safeIndex;
              return (
                <button
                  key={`${view.url}-${i}`}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={label}
                  aria-current={selected ? 'true' : undefined}
                  className={`flex-shrink-0 w-[4.5rem] border-2 transition-colors ${
                    selected ? 'border-ink' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={view.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className={`block text-[9px] font-semibold uppercase tracking-wide truncate px-0.5 py-1 ${
                      selected ? 'text-ink' : 'text-ink-muted'
                    }`}
                  >
                    {label.split(' · ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
