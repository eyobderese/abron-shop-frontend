import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import {
  useCategories,
  findBySlug,
  collectDescendantIds,
  getAncestors,
} from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/ui/ProductCard';
import AdSlot from '../../components/ui/AdSlot';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { catLabel, dict } from '../../lib/i18n';
import { useLang } from '../../context/LanguageContext';
import Seo, { pageUrl } from '../../components/seo/Seo';

function FilterPanel({
  sidebarRoots,
  slug,
  onPick,
  priceMax,
  setPriceMax,
  sort,
  setSort,
  lang,
}) {
  const d = dict(lang);
  return (
    <>
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">
          {d.categories}
        </h3>
        <ul className="space-y-0.5">
          {sidebarRoots.map((root) => (
            <SubtreeNav
              key={root.id}
              node={root}
              currentSlug={slug}
              onPick={onPick}
              lang={lang}
            />
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">
          {d.priceRange}
        </h3>
        <label className="block text-xs text-ink-muted mb-1">
          Max price ($)
        </label>
        <input
          type="number"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          placeholder="e.g. 100"
          className="w-full border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-ink"
        />
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">
          Sort
        </h3>
        {[
          { v: 'newest', l: 'Newest' },
          { v: 'price-asc', l: 'Price: Low → High' },
          { v: 'price-desc', l: 'Price: High → Low' },
          { v: 'discount', l: 'Biggest discount' },
        ].map((opt) => (
          <label
            key={opt.v}
            className="flex items-center gap-2 py-1 cursor-pointer"
          >
            <input
              type="radio"
              name="sort"
              checked={sort === opt.v}
              onChange={() => setSort(opt.v)}
              className="accent-ink"
            />
            <span className="text-sm text-ink-soft">{opt.l}</span>
          </label>
        ))}
      </div>
    </>
  );
}

function SubtreeNav({ node, currentSlug, onPick, lang }) {
  const isActive = node.slug === currentSlug;
  return (
    <li>
      <Link
        to={`/category/${node.slug}`}
        onClick={onPick}
        className={`block py-1.5 text-sm no-underline ${
          isActive
            ? 'text-sale font-semibold'
            : 'text-ink-soft hover:text-ink'
        }`}
      >
        {catLabel(node, lang)}
      </Link>
      {node.children?.length > 0 && (
        <ul className="pl-3 border-l border-gray-100 space-y-0.5 mt-1">
          {node.children.map((c) => (
            <SubtreeNav
              key={c.id}
              node={c}
              currentSlug={currentSlug}
              onPick={onPick}
              lang={lang}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CategoryPage() {
  const { slug } = useParams();
  const { categories, tree, loading: catsLoading } = useCategories();
  const { lang } = useLang();
  const d = dict(lang);
  const amharic = lang !== 'or';

  const currentCat = useMemo(
    () => findBySlug(categories, slug),
    [categories, slug]
  );

  const ids = useMemo(
    () => (currentCat ? collectDescendantIds(categories, currentCat.id) : []),
    [categories, currentCat]
  );

  const { products, loading } = useProducts({
    categoryIds: ids.length ? ids : undefined,
  });

  const [sort, setSort] = useState('newest');
  const [priceMax, setPriceMax] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visibleProducts = useMemo(() => {
    let list = products.slice();
    if (priceMax) {
      const cap = Number(priceMax);
      if (!Number.isNaN(cap)) {
        list = list.filter((p) => p.price != null && Number(p.price) <= cap);
      }
    }
    if (sort === 'price-asc')
      list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    else if (sort === 'price-desc')
      list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    else if (sort === 'discount') {
      list.sort((a, b) => {
        const da =
          a.was_price && a.price ? (a.was_price - a.price) / a.was_price : 0;
        const db =
          b.was_price && b.price ? (b.was_price - b.price) / b.was_price : 0;
        return db - da;
      });
    }
    return list;
  }, [products, sort, priceMax]);

  const ancestors = currentCat
    ? getAncestors(categories, currentCat.id)
    : [];

  // Subtree to show in sidebar: if current has children, show them; otherwise
  // show siblings so the user can move laterally.
  const sidebarRoots = useMemo(() => {
    if (!currentCat) return tree;
    if (currentCat.children?.length) {
      const self = categories.find((c) => c.id === currentCat.id);
      return [{ ...self, children: currentCat.children }];
    }
    if (currentCat.parent_id) {
      const parent = categories.find((c) => c.id === currentCat.parent_id);
      if (parent) {
        const siblings = categories
          .filter((c) => c.parent_id === parent.id)
          .map((c) => ({ ...c, children: [] }));
        return [{ ...parent, children: siblings }];
      }
    }
    return tree;
  }, [currentCat, categories, tree]);

  if (catsLoading) return <LoadingSpinner />;

  if (!currentCat) {
    return (
      <>
        <Seo
          title="Category Not Found"
          description="The requested Abron Shop category could not be found."
          canonical={false}
          noindex
        />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-ink mb-2">
          Category not found
        </h1>
        <p
          className={`text-ink-muted mb-6 ${amharic ? 'font-amharic' : ''}`}
        >
          {amharic ? 'ምድቡ አልተገኘም።' : 'Gosichi hin argamne.'}
        </p>
        <Link to="/" className="text-ink underline">
          Back home · {d.home}
        </Link>
        </div>
      </>
    );
  }

  const panelProps = {
    sidebarRoots,
    slug,
    priceMax,
    setPriceMax,
    sort,
    setSort,
    lang,
  };
  const categoryPath = `/category/${currentCat.slug}`;
  const categoryDescription = `Shop ${currentCat.name_en} products from authentic American brands, available through Abron Shop for delivery to Ethiopia.`;
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: pageUrl('/') },
    ...ancestors.map((category, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: category.name_en,
      item: pageUrl(`/category/${category.slug}`),
    })),
  ];

  return (
    <>
      <Seo
        title={`${currentCat.name_en} Products`}
        description={categoryDescription}
        path={categoryPath}
        image={currentCat.image_url}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbItems,
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center flex-wrap gap-1 text-xs text-ink-muted mb-4">
        <Link to="/" className="hover:text-ink">
          Home
        </Link>
        {ancestors.map((a, i) => (
          <span key={a.id} className="flex items-center gap-1">
            <ChevronRight size={12} />
            {i === ancestors.length - 1 ? (
              <span className="text-ink">{catLabel(a, lang)}</span>
            ) : (
              <Link to={`/category/${a.slug}`} className="hover:text-ink">
                {catLabel(a, lang)}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink">
          {currentCat.name_en}
          {(() => {
            const local =
              lang === 'or' ? currentCat.name_or : currentCat.name_am;
            if (!local) return null;
            return (
              <span
                className={`font-semibold text-sale ml-3 ${
                  amharic ? 'font-amharic' : ''
                }`}
              >
                · {local}
              </span>
            );
          })()}
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          {visibleProducts.length}{' '}
          {visibleProducts.length === 1 ? 'item' : 'items'}
        </p>
      </header>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <FilterPanel {...panelProps} />
        </aside>

        <div className="flex-1 min-w-0">
          {/* Category-targeted ad (only renders if one exists for this category) */}
          <AdSlot
            placement="category_top"
            categoryId={currentCat.id}
            bare
            className="mb-6"
          />

          {/* Mobile filter trigger */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden mb-4 inline-flex items-center gap-2 border border-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
          >
            <SlidersHorizontal size={14} /> {d.filter}
          </button>

          {loading ? (
            <LoadingSpinner />
          ) : visibleProducts.length === 0 ? (
            <EmptyState message={`${d.noProducts} · No products yet.`} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />
          <aside className="absolute right-0 top-0 bottom-0 w-80 max-w-[85%] bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold uppercase tracking-wider">
                {d.filter}
              </h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <FilterPanel
              {...panelProps}
              onPick={() => setFiltersOpen(false)}
            />
          </aside>
        </div>
      )}
      </div>
    </>
  );
}
