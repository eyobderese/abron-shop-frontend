import { Link } from 'react-router-dom';
import Seo, { pageUrl } from '../../components/seo/Seo';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import LoadError from '../../components/ui/LoadError';
import EmptyState from '../../components/ui/EmptyState';
import { useBrands } from '../../hooks/useBrands';

export default function BrandsPage() {
  const { brands, loading, error, refetch } = useBrands();
  const featuredBrandNames = brands.slice(0, 4).map((brand) => brand.name);
  const description = featuredBrandNames.length
    ? `Browse ${featuredBrandNames.join(', ')} and other authentic brands available through Abron Shop in Addis Ababa and across Ethiopia.`
    : 'Browse authentic shoes, clothing, cosmetics and other brands available through Abron Shop in Addis Ababa and across Ethiopia.';
  const listSchema = brands.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Brands available at Abron Shop',
        numberOfItems: brands.length,
        itemListElement: brands.map((brand, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: brand.name,
          url: pageUrl(`/brands/${brand.slug}`),
        })),
      }
    : null;

  return (
    <>
      <Seo
        title="American Brands in Ethiopia"
        description={description}
        path="/brands"
        jsonLd={listSchema}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Brands in Ethiopia
          </h1>
          <p className="mt-3 text-sm leading-7 text-ink-soft md:text-base">
            Browse authentic shoes, clothing, cosmetics and other products from
            brands sourced in the USA and available through Abron Shop in Addis
            Ababa and across Ethiopia.
          </p>
        </header>

        {error ? (
          <LoadError title="Could not load brands" message={error.message} onRetry={refetch} />
        ) : loading ? (
          <LoadingSpinner />
        ) : brands.length === 0 ? (
          <EmptyState message="No brands are available yet." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                to={`/brands/${brand.slug}`}
                className="border border-gray-200 bg-white p-5 no-underline transition hover:border-ink hover:shadow-sm"
              >
                <h2 className="font-bold text-ink">{brand.name}</h2>
                <p className="mt-1 text-xs text-ink-muted">
                  {brand.product_count} {brand.product_count === 1 ? 'product' : 'products'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
