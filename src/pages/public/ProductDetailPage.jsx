import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import {
  useProduct,
  useProductVariants,
  useRelatedProducts,
} from '../../hooks/useProducts';
import { useCategories, getAncestors } from '../../hooks/useCategories';
import ImageGallery from '../../components/ui/ImageGallery';
import InquiryForm from '../../components/forms/InquiryForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  catLabel,
  dict,
  productLocalName,
  productLocalDescription,
} from '../../lib/i18n';
import { useLang } from '../../context/LanguageContext';
import Seo, { absoluteUrl, pageUrl } from '../../components/seo/Seo';
import { getProductViews } from '../../lib/productViews';
import { formatMoney, productCurrency } from '../../lib/currency';
import ProductCard from '../../components/ui/ProductCard';
import LoadError from '../../components/ui/LoadError';

function pct(was, now) {
  const w = Number(was);
  const n = Number(now);
  if (!w || !n || n >= w) return null;
  return Math.round(((w - n) / w) * 100);
}

export default function ProductDetailPage() {
  const { slug, id } = useParams();
  const identifier = slug || id;
  const { product, loading, error, refetch } = useProduct(identifier);
  const { products: colorVariants } = useProductVariants(identifier);
  const { products: relatedProducts, loading: relatedLoading } =
    useRelatedProducts(identifier, 8);
  const { categories } = useCategories();
  const { lang } = useLang();
  const d = dict(lang);
  const amharic = lang !== 'or';

  if (loading) {
    return (
      <>
        <Seo
          title="Loading Product"
          description="Loading product information from Abron Shop."
          canonical={false}
          noindex
        />
        <LoadingSpinner />
      </>
    );
  }

  if (error && error.status !== 404) {
    return (
      <>
        <Seo
          title="Unable to Load Product"
          description="The product could not be loaded because of a connection problem."
          canonical={false}
          noindex
        />
        <LoadError
          title="Could not load the product"
          message={error.message}
          onRetry={refetch}
        />
      </>
    );
  }

  if (error?.status === 404 || !product) {
    return (
      <>
        <Seo
          title="Product Not Found"
          description="The requested Abron Shop product could not be found."
          canonical={false}
          noindex
        />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-ink mb-2">Product Not Found</h1>
        <p className="text-ink-muted mb-6">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link to="/" className="text-ink underline">
          Back to Home · {d.home}
        </Link>
        </div>
      </>
    );
  }

  if (product.slug && identifier !== product.slug) {
    return <Navigate to={`/products/${product.slug}`} replace />;
  }

  const localName = productLocalName(product, lang);
  const localDesc = productLocalDescription(product, lang);

  const ancestors = product.category_id
    ? getAncestors(categories, product.category_id)
    : [];
  const off = pct(product.was_price, product.price);
  const currency = productCurrency(product);
  const productPath = `/products/${product.slug}`;
  const productUrl = pageUrl(productPath);
  const imageUrls = getProductViews(product)
    .map((view) => absoluteUrl(view.url))
    .filter(Boolean);
  const productDescription = product.description ||
    `View ${product.name}, availability and delivery information from Abron Shop.`;
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: productDescription,
    url: productUrl,
    ...(imageUrls.length > 0 && { image: imageUrls }),
    ...(product.brand && {
      brand: { '@type': 'Brand', name: product.brand },
    }),
    ...(product.color_name && { color: product.color_name }),
    ...(product.color_code && { sku: product.color_code }),
    ...(product.price != null && {
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: currency,
        price: String(product.price),
        availability: product.in_stock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
    }),
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: pageUrl('/') },
      ...ancestors.map((category, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: category.name_en,
        item: pageUrl(`/category/${category.slug}`),
      })),
      {
        '@type': 'ListItem',
        position: ancestors.length + 2,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <Seo
        title={product.name}
        description={productDescription}
        path={productPath}
        image={imageUrls[0]}
        type="product"
        jsonLd={[productSchema, breadcrumbSchema]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center flex-wrap gap-1 text-xs text-ink-muted mb-6">
        <Link to="/" className="hover:text-ink">
          Home
        </Link>
        {ancestors.map((a) => (
          <span key={a.id} className="flex items-center gap-1">
            <ChevronRight size={12} />
            <Link to={`/category/${a.slug}`} className="hover:text-ink">
              {catLabel(a, lang)}
            </Link>
          </span>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ImageGallery product={product} />

        <div>
          {product.brand && (
            <p className="text-sm font-bold uppercase tracking-wider text-ink mb-1">
              {product.brand}
            </p>
          )}
          <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">
            {product.name}
          </h1>
          {localName && (
            <p
              className={`text-lg md:text-xl text-ink-soft mb-3 ${
                amharic ? 'font-amharic' : ''
              }`}
            >
              {localName}
            </p>
          )}

          {colorVariants.length > 1 && (
            <div className="my-5 border-y border-gray-200 py-5">
              <p className="mb-3 text-sm font-semibold text-ink">
                Color · {d.color}:{' '}
                <span className="font-normal">{product.color_name}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {colorVariants.map((variant) => {
                  const thumbnail = getProductViews(variant)[0]?.url;
                  const active = variant.id === product.id;
                  return (
                    <Link
                      key={variant.id}
                      to={`/products/${variant.slug}`}
                      title={variant.color_name || variant.name}
                      aria-label={`Select ${variant.color_name || variant.name}`}
                      aria-current={active ? 'true' : undefined}
                      className={`relative h-16 w-16 overflow-hidden border-2 bg-white p-0.5 transition-colors ${
                        active
                          ? 'border-ink'
                          : 'border-gray-200 hover:border-ink-muted'
                      } ${variant.in_stock ? '' : 'opacity-50'}`}
                    >
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span
                          className="block h-full w-full"
                          style={{ backgroundColor: variant.color_hex || '#f3f4f6' }}
                        />
                      )}
                      {active && (
                        <span className="absolute inset-x-0 bottom-0 bg-ink py-0.5 text-center text-[9px] font-bold uppercase text-white">
                          Selected
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-4">
            {product.price != null && (
              <span
                className={`text-2xl font-bold ${off != null ? 'text-sale' : 'text-ink'}`}
              >
                {formatMoney(product.price, currency)}
              </span>
            )}
            {product.was_price != null && off != null && (
              <>
                <span className="text-base text-ink-muted line-through">
                  {formatMoney(product.was_price, currency)}
                </span>
                <span className="bg-sale text-white text-xs font-bold px-2 py-0.5 uppercase">
                  {off}% off
                </span>
              </>
            )}
          </div>

          <div
            className={`inline-block px-3 py-1 text-xs font-medium uppercase tracking-wide mb-6 ${
              product.in_stock
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {product.in_stock
              ? `In Stock · ${d.inStock}`
              : `Sold Out · ${d.outOfStock}`}
          </div>

          <div className="border-t border-gray-200 pt-6 mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-2">
              Description · {d.description}
            </h2>
            <p className="text-sm text-ink-soft whitespace-pre-wrap leading-relaxed">
              {product.description}
            </p>
            {localDesc && (
              <p
                className={`text-sm text-ink-soft whitespace-pre-wrap leading-relaxed mt-3 pt-3 border-t border-gray-100 ${
                  amharic ? 'font-amharic' : ''
                }`}
              >
                {localDesc}
              </p>
            )}
          </div>

          <InquiryForm product={product} />
        </div>
      </div>

      {(relatedLoading || relatedProducts.length > 0) && (
        <section className="border-t border-gray-200 mt-14 pt-10">
          <h2 className="text-xl font-bold uppercase tracking-wider text-ink mb-6">
            You may also like · {d.relatedProducts}
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {relatedLoading
              ? Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[3/4] bg-gray-100" />
                    <div className="mt-3 h-3 w-1/3 bg-gray-100" />
                    <div className="mt-2 h-4 w-3/4 bg-gray-100" />
                  </div>
                ))
              : relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
          </div>
        </section>
      )}
      </div>
    </>
  );
}
