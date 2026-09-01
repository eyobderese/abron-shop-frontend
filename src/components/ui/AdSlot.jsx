import { useAds } from '../../hooks/useAds';

// Small badge so shoppers can tell an ad apart from product content.
function SponsoredBadge() {
  return (
    <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
      Sponsored
    </span>
  );
}

function Media({ ad, className }) {
  if (ad.media_type === 'video') {
    return (
      <video
        src={ad.media_url}
        poster={ad.poster_url || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={className}
      />
    );
  }
  return <img src={ad.media_url} alt={ad.title} className={className} />;
}

function AdWrapper({ ad, children, className }) {
  const Inner = (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      <SponsoredBadge />
      {children}
    </div>
  );
  if (!ad.link_url) return Inner;
  return (
    <a
      href={ad.link_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="block no-underline"
    >
      {Inner}
    </a>
  );
}

// placement = 'home_hero' | 'home_strip' | 'category_top'
// categoryId is only used when placement === 'category_top'.
// `bare`  = skip the page-width wrapper (useful when parent already
//            constrains the width, e.g. inside a category grid column).
export default function AdSlot({
  placement,
  categoryId,
  className = '',
  bare = false,
}) {
  const { ads, loading } = useAds({ placement, categoryId });
  if (loading || !ads.length) return null;
  const ad = ads[0]; // Lowest sort_order wins; admin controls the priority.

  const aspect =
    placement === 'home_hero'
      ? 'aspect-[21/9] md:aspect-[21/6]'
      : placement === 'category_top'
        ? 'aspect-[21/7]'
        : 'aspect-[16/9] md:aspect-[21/8]';

  const slot = (
    <AdWrapper ad={ad} className={aspect}>
      <Media
        ad={ad}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </AdWrapper>
  );

  if (bare) return <div className={className}>{slot}</div>;
  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {slot}
    </section>
  );
}
