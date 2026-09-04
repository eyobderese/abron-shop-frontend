export default function BrandLogo({
  className = '',
  loading = 'lazy',
  priority = false,
}) {
  return (
    <img
      src="/brand-logo.png"
      alt="Abron Shop"
      width="640"
      height="223"
      className={className}
      loading={loading}
      decoding="async"
      {...(priority ? { fetchPriority: 'high' } : {})}
    />
  );
}
