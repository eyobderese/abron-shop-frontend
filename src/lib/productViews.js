// Product views: each angle/photo with an optional label (front, back, side, …).
// Stored in `image_views` JSONB; `images` TEXT[] is kept in sync for backward compatibility.

export const VIEW_LABEL_OPTIONS = [
  { value: 'front', en: 'Front' },
  { value: 'back', en: 'Back' },
  { value: 'side', en: 'Side' },
  { value: 'detail', en: 'Detail' },
  { value: 'lifestyle', en: 'Lifestyle' },
  { value: 'other', en: 'Other' },
];

const DEFAULT_LABEL_CYCLE = VIEW_LABEL_OPTIONS.map((o) => o.value);

export function defaultViewLabel(index) {
  return DEFAULT_LABEL_CYCLE[index % DEFAULT_LABEL_CYCLE.length];
}

/** Normalize DB row → [{ url, label }] */
export function getProductViews(product) {
  if (!product) return [];

  const raw = product.image_views;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .filter((v) => v && v.url)
      .map((v) => ({
        url: v.url,
        label: v.label || defaultViewLabel(0),
      }));
  }

  const legacy = product.images;
  if (Array.isArray(legacy) && legacy.length > 0) {
    return legacy.map((url, i) => ({
      url,
      label: defaultViewLabel(i),
    }));
  }

  return [];
}

export function viewsToImageUrls(views) {
  return views.map((v) => v.url).filter(Boolean);
}

export function viewsToPayload(views) {
  const cleaned = views
    .filter((v) => v.url)
    .map((v) => ({
      url: v.url,
      label: v.label || 'other',
    }));
  return {
    image_views: cleaned,
    images: viewsToImageUrls(cleaned),
  };
}

export function viewLabelText(label, lang, d) {
  const preset = VIEW_LABEL_OPTIONS.find((o) => o.value === label);
  if (preset) {
    const key = `view_${label}`;
    if (d && d[key]) return `${preset.en} · ${d[key]}`;
    return preset.en;
  }
  return label || 'View';
}

export function storagePathFromUrl(url) {
  if (!url) return null;
  const marker = '/product-image/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}
