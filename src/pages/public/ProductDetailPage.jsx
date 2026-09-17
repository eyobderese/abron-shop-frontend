import { useState } from 'react';
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

function SizeSelector({ sizes, selectedSize, onSelect, lang }) {
  if (!sizes.length) return null;
  const translatedSize = lang === 'or' ? 'Safara' : 'መጠን';

  return (
    <div>
      <p id="product-size-label" className="mb-3 text-sm font-semibold text-ink">
        Size · {translatedSize}: *
      </p>
      {sizes.length <= 12 ? (
        <div
          role="group"
          aria-labelledby="product-size-label"
          className="flex flex-wrap gap-2"
        >
          {sizes.map((size) => {
            const selected = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(size)}
                className={`inline-flex min-w-12 items-center justify-center border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  selected
                    ? 'border-ink bg-ink text-white'
                    : 'border-gray-300 bg-white text-ink hover:border-ink'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      ) : (
        <select
          value={selectedSize}
          onChange={(event) => onSelect(event.target.value)}
          aria-labelledby="product-size-label"
          className="w-full border border-gray-300 bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink sm:max-w-xs"
        >
          <option value="" disabled>
            Select an available size
          </option>
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      )}
      {!selectedSize && (
        <p className="mt-2 text-xs text-ink-muted">
          Select a size before sending your inquiry.
        </p>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const [sizeSelection, setSizeSelection] = useState({
    productId: null,
    size: '',
  });
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
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const selectedSize =
    sizeSelection.productId === product?.id ? sizeSelection.size : '';

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
  const productType = product.product_type || 'product';
  const displayProductType = productType.toLocaleLowerCase();
  const colorText = product.color_name ? ` in ${product.color_name}` : '';
  const productSeoText = `Looking for ${product.brand ? `${product.brand} ` : ''}${displayProductType} in Ethiopia? ${product.name}${colorText} is available through Abron Shop. We bring authentic products from the USA to customers in Addis Ababa and across Ethiopia. Review the price, available sizes and colors, then send an inquiry.`;
  const productSeoDescription = `${productSeoText} ${productDescription}`;
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    category: productType,
    description: productDescription,
    url: productUrl,
    ...(imageUrls.length > 0 && { image: imageUrls }),
    ...(product.brand && {
      brand: { '@type': 'Brand', name: product.brand },
    }),
    ...(product.family_name && { model: product.family_name }),
    ...(product.model_code && { mpn: product.model_code }),
    ...(product.color_name && { color: product.color_name }),
    ...((product.model_code || product.color_code) && {
      sku: [product.model_code, product.color_code].filter(Boolean).join('-'),
    }),
    ...(product.price != null && {
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: currency,
        price: String(product.price),
        availability: product.in_stock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Abron Shop',
        },
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
        title={`${product.name} in Ethiopia`}
        description={productSeoDescription}
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

          {(colorVariants.length > 1 || sizes.length > 0) && (
            <div className="my-5 space-y-5 border-y border-gray-200 py-5">
              {colorVariants.length > 1 && (
                <div>
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
                              style={{
                                backgroundColor: variant.color_hex || '#f3f4f6',
                              }}
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

              <SizeSelector
                sizes={sizes}
                selectedSize={selectedSize}
                onSelect={(size) =>
                  setSizeSelection({ productId: product.id, size })
                }
                lang={lang}
              />
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

          <InquiryForm product={product} selectedSize={selectedSize} />
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

      <section className="mt-14 border-t border-gray-200 pt-8 text-sm leading-7 text-ink-soft">
        <h2 className="mb-2 text-base font-semibold text-ink">
          About this {displayProductType}
        </h2>
        <p>{productSeoText}</p>
      </section>
      </div>
    </>
  );
}
