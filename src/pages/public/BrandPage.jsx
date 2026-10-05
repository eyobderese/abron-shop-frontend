import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Seo, { pageUrl } from '../../components/seo/Seo';
import ProductCard from '../../components/ui/ProductCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import LoadError from '../../components/ui/LoadError';
import { useBrandProducts } from '../../hooks/useBrands';

export default function BrandPage() {
  const { slug } = useParams();
  const { brand, products, loading, error, refetch } = useBrandProducts(slug);

  if (loading) return <LoadingSpinner />;

  if (error?.status === 404) {
    return (
      <>
        <Seo title="Brand Not Found" description="The requested brand was not found." canonical={false} noindex />
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-ink">Brand not found</h1>
          <Link to="/brands" className="mt-5 inline-block underline">Browse all brands</Link>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Seo title="Unable to Load Brand" description="The brand could not be loaded." canonical={false} noindex />
        <LoadError title="Could not load this brand" message={error.message} onRetry={refetch} />
      </>
    );
  }

  const name = brand?.name || slug;
  const types = [...new Set(products.map((product) => product.product_type?.toLowerCase()).filter(Boolean))];
  const typeSummary = types.slice(0, 3).join(', ') || 'products';
  const description = `Shop ${name} ${typeSummary} in Ethiopia. Browse authentic ${name} products sourced from the USA and available through Abron Shop in Addis Ababa and across Ethiopia.`;
  const brandUrl = pageUrl(`/brands/${brand.slug}`);
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: pageUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Brands', item: pageUrl('/brands') },
        { '@type': 'ListItem', position: 3, name, item: brandUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${name} products in Ethiopia`,
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: product.name,
        url: pageUrl(`/products/${product.slug}`),
      })),
    },
  ];

  return (
    <>
      <Seo
        title={`${name} in Ethiopia`}
        description={description}
        path={`/brands/${brand.slug}`}
        image={products[0]?.images?.[0]}
        jsonLd={schemas}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-5 flex items-center gap-1 text-xs text-ink-muted">
          <Link to="/">Home</Link>
          <ChevronRight size={12} />
          <Link to="/brands">Brands</Link>
          <ChevronRight size={12} />
          <span className="text-ink">{name}</span>
        </nav>

        <header className="mb-8 max-w-4xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            {name} in Ethiopia
          </h1>
          <p className="mt-4 text-sm leading-7 text-ink-soft md:text-base">{description}</p>
        </header>

        <p className="mb-5 text-sm text-ink-muted">
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
