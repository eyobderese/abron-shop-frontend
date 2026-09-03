const configuredSiteUrl = import.meta.env.VITE_SITE_URL || 'https://abronshop.online';

export const SITE_URL = configuredSiteUrl.replace(/\/+$/, '');

function cleanText(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function absoluteUrl(value) {
  if (!value) return undefined;
  try {
    return new URL(value, `${SITE_URL}/`).href;
  } catch {
    return undefined;
  }
}

export function pageUrl(path = '/') {
  return new URL(path, `${SITE_URL}/`).href;
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export default function Seo({
  title,
  description,
  path = '/',
  canonical,
  image,
  type = 'website',
  noindex = false,
  jsonLd = [],
}) {
  const fullTitle = title.includes('Abron Shop') ? title : `${title} | Abron Shop`;
  const summary = cleanText(description, 160);
  const canonicalUrl = canonical === false ? null : absoluteUrl(canonical || path);
  const imageUrl = absoluteUrl(image);
  const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={summary} />
      <meta
        name="robots"
        content={noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}
      />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:site_name" content="Abron Shop" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={summary} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {imageUrl && <meta property="og:image" content={imageUrl} />}

      <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={summary} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      {schemas.filter(Boolean).map((schema, index) => (
        <script
          key={`${schema['@type'] || 'schema'}-${index}`}
          type="application/ld+json"
        >
          {safeJson(schema)}
        </script>
      ))}
    </>
  );
}
