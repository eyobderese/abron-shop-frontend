import { useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/ui/ProductCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { dict } from '../../lib/i18n';
import { useLang } from '../../context/LanguageContext';
import Seo from '../../components/seo/Seo';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const { lang } = useLang();
  const d = dict(lang);
  const amharic = lang !== 'or';

  const { products, loading } = useProducts({ search: q });

  return (
    <>
      <Seo
        title={q ? `Search results for ${q}` : 'Search'}
        description="Search the Abron Shop product catalog."
        path="/search"
        noindex
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink">
          Search
          <span
            className={`font-semibold text-sale ml-3 ${
              amharic ? 'font-amharic' : ''
            }`}
          >
            · {d.search}
          </span>
        </h1>
        {q ? (
          <p className="text-sm text-ink-muted mt-2">
            Results for <span className="text-ink font-semibold">“{q}”</span> —{' '}
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </p>
        ) : (
          <p className="text-sm text-ink-muted mt-2">
            Type a keyword in the search bar to find products.
          </p>
        )}
      </header>

      {!q ? null : loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div>
          <EmptyState message={`${d.noProducts} · No matches for “${q}”.`} />
          <div className="text-center">
            <Link to="/" className="text-ink underline text-sm">
              Back home · {d.home}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      </div>
    </>
  );
}
