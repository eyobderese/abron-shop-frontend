import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useProduct } from '../../hooks/useProducts';
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

function pct(was, now) {
  const w = Number(was);
  const n = Number(now);
  if (!w || !n || n >= w) return null;
  return Math.round(((w - n) / w) * 100);
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
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

  if (error || !product) {
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

  const localName = productLocalName(product, lang);
  const localDesc = productLocalDescription(product, lang);

  const ancestors = product.category_id
    ? getAncestors(categories, product.category_id)
    : [];
  const off = pct(product.was_price, product.price);
  const productPath = `/product/${product.id}`;
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
    ...(product.price != null && {
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'USD',
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

          <div className="flex items-baseline gap-3 mb-4">
            {product.price != null && (
              <span
                className={`text-2xl font-bold ${off != null ? 'text-sale' : 'text-ink'}`}
              >
                ${Number(product.price).toFixed(2)}
              </span>
            )}
            {product.was_price != null && off != null && (
              <>
                <span className="text-base text-ink-muted line-through">
                  ${Number(product.was_price).toFixed(2)}
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
      </div>
    </>
  );
}
