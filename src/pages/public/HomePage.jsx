import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Phone,
  ShieldCheck,
  Truck,
  Wallet,
} from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { useBrands } from '../../hooks/useBrands';
import ProductCard from '../../components/ui/ProductCard';
import AdSlot from '../../components/ui/AdSlot';
import { catLocal } from '../../lib/i18n';
import { getProductViews } from '../../lib/productViews';
import { useLang } from '../../context/LanguageContext';
import Seo, { SITE_URL } from '../../components/seo/Seo';
import LoadError from '../../components/ui/LoadError';
import FlashDealsSection from '../../components/flash/FlashDealsSection';
import {
  CONTACTS,
  DEPOSIT_PERCENT,
  DELIVERY_DAYS,
  FAQ,
  PROMISES,
  STEPS,
  faqSchema,
  local,
  storeSchema,
} from '../../lib/trust';

const PROMISE_ICONS = {
  deposit: Wallet,
  delivery: Truck,
  guarantee: ShieldCheck,
  original: BadgeCheck,
};

/** The Amharic (or Oromo) line shown under an English one. */
function Sub({ children, amharic, className = '' }) {
  if (!children) return null;
  return <span className={`block ${amharic ? 'font-amharic' : ''} ${className}`}>{children}</span>;
}

function SectionTitle({ en, sub, amharic, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
        {en}
        <Sub amharic={amharic} className="text-sm md:text-base font-medium text-ink-muted mt-1 tracking-normal">
          {sub}
        </Sub>
      </h2>
      {action}
    </div>
  );
}

/** Pick one shoe with several angles for the hero (newest first). */
function pickHeroProduct(products) {
  const withViews = products
    .map((product) => ({
      product,
      views: getProductViews(product).filter((v) => v.label !== 'lifestyle'),
    }))
    .filter((x) => x.views.length > 0);
  const isShoe = (p) => /shoe|sneaker|boot/i.test(`${p.product_type} ${p.name} ${p.categories?.name_en || ''}`);
  return (
    withViews.find((x) => x.views.length >= 3 && isShoe(x.product)) ||
    withViews.find((x) => x.views.length >= 2) ||
    withViews[0] ||
    null
  );
}

const VIEW_NAMES = { front: 'Front', back: 'Back', side: 'Side', detail: 'Detail', other: 'View' };

/** One shoe, turning through its photos (front, side, back…) every few seconds. */
function HeroShowcase({ products }) {
  const pick = pickHeroProduct(products);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = pick?.views.length || 0;

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 2800);
    return () => clearInterval(id);
  }, [count, paused]);

  // No photos (still loading or the request failed): show nothing rather than an empty box.
  if (!pick) return null;
  const { product, views } = pick;
  const current = index % views.length;

  return (
    <div
      className="bg-white p-4 sm:p-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-[5/4] bg-[#f7f7f7] overflow-hidden no-underline"
        aria-label={product.name}
      >
        {views.map((view, i) => (
          <img
            key={view.url}
            src={view.url}
            alt={i === current ? product.name : ''}
            loading={i === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 w-full h-full object-contain p-[10%] mix-blend-multiply transition-all duration-700 ease-out ${
              i === current ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        ))}
      </Link>
      <div className="flex items-center justify-between gap-3 mt-4">
        <Link to={`/products/${product.slug}`} className="min-w-0 no-underline group">
          {product.brand && (
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">{product.brand}</p>
          )}
          <p className="text-sm font-semibold text-ink truncate group-hover:underline">{product.name}</p>
        </Link>
        {views.length > 1 && (
          <div className="flex items-center gap-1.5 shrink-0" role="tablist" aria-label="Photo angles">
            {views.map((view, i) => (
              <button
                key={view.url}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={VIEW_NAMES[view.label] || 'View'}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-ink' : 'w-1.5 bg-gray-300 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const {
    tree,
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts({ limit: 24 });
  const { brands } = useBrands();
  const loadError = categoriesError || productsError;
  const { lang } = useLang();
  const amharic = lang !== 'or';

  const inStock = products.filter((p) => p.in_stock !== false);
  const newArrivals = (inStock.length >= 8 ? inStock : products).slice(0, 12);
  const topBrands = [...brands]
    .filter((b) => b.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count)
    .slice(0, 12);

  return (
    <>
      <Seo
        title="American Shoes in Ethiopia – Original US Brands | Abron Shop"
        description={`Original American shoes, clothing and perfume delivered in Ethiopia in about ${DELIVERY_DAYS} days. Nike, New Balance, Skechers and more. Pay only ${DEPOSIT_PERCENT}% to order, the rest on delivery.`}
        path="/"
        jsonLd={[
          storeSchema(SITE_URL),
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Abron Shop',
            alternateName: 'አብሮን ሱቅ',
            url: SITE_URL,
          },
          faqSchema(),
        ]}
      />

      {/* A failed request (offline, server down) shows the retry first, where customers
          look — never admin links. */}
      {loadError && (
        <div className="border-b border-gray-200">
          <LoadError
            title="Could not load products"
            message={
              loadError.isNetworkError
                ? loadError.message
                : 'Something went wrong while loading products. Please try again.'
            }
          />
        </div>
      )}

      {/* Hero: what we sell + the payment promise, with real products */}
      <section className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <p className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[11px] font-bold uppercase tracking-wider px-3 py-1 mb-5">
              🇺🇸 USA → 🇪🇹 Ethiopia
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink leading-[1.05]">
              Original American Shoes,{' '}
              <span className="text-sale">Delivered in Ethiopia.</span>
            </h1>
            <Sub amharic={amharic} className="text-xl md:text-2xl text-ink mt-4 font-semibold">
              {amharic
                ? 'ኦሪጂናል የአሜሪካ ጫማዎች እና ልብሶች — እዚሁ ኢትዮጵያ'
                : 'Kophee fi uffata Ameerikaa dhugaa — Itoophiyaa keessatti'}
            </Sub>
            <p className="text-base text-ink-soft mt-5 max-w-lg">
              Pick what you like and send an inquiry. We call you to agree on everything. You pay{' '}
              <b className="text-ink">only {DEPOSIT_PERCENT}%</b> to order, and the rest when it reaches you.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <a
                href="#new-arrivals"
                className="bg-ink text-white px-6 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-black no-underline inline-flex items-center gap-2"
              >
                Shop new arrivals <ArrowRight size={16} />
              </a>
              <a
                href={`tel:${CONTACTS[0].tel}`}
                className="bg-white border border-ink text-ink px-6 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-gray-50 no-underline inline-flex items-center gap-2"
              >
                <Phone size={16} /> {CONTACTS[0].display}
              </a>
            </div>
          </div>
          <HeroShowcase products={newArrivals} />
        </div>
      </section>

      {/* Promise strip */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {PROMISES.map((p) => {
            const Icon = PROMISE_ICONS[p.key];
            return (
              <div key={p.key} className="flex gap-3">
                <Icon size={26} className="text-sale shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-ink leading-snug">{p.en}</p>
                  <Sub amharic={amharic} className="text-xs text-ink-muted mt-0.5">{local(p, lang)}</Sub>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Flash deals: only shown while at least one deal is running */}
      <FlashDealsSection amharic={amharic} />

      {/* New arrivals: one even grid instead of half-empty category strips */}
      <section id="new-arrivals" hidden={!!loadError} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-32">
        <SectionTitle
          en="New Arrivals"
          sub={amharic ? 'አዲስ የገቡ ዕቃዎች' : 'Meeshaalee haaraa'}
          amharic={amharic}
          action={
            <Link to="/categories" className="text-xs font-bold uppercase tracking-wider text-ink hover:text-sale no-underline inline-flex items-center gap-1 shrink-0">
              View all <ArrowRight size={12} />
            </Link>
          }
        />
        {productsLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* How ordering and payment work */}
      <section className="bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">
            How you order — no risk
            <Sub amharic={amharic} className="text-sm md:text-base font-medium text-white/70 mt-1">
              {amharic ? 'እንዴት እንደሚያዝዙ — ያለ ስጋት' : 'Akkamitti ajajattu — sodaa malee'}
            </Sub>
          </h2>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {STEPS.map((step, i) => (
              <li key={step.en} className="border border-white/15 p-5">
                <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-sale text-white font-extrabold">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-bold text-lg leading-snug">{step.en}</h3>
                <Sub amharic={amharic} className="text-xs text-white/60 mt-0.5">{local(step, lang)}</Sub>
                <p className="text-sm text-white/80 mt-3 leading-relaxed">{step.desc}</p>
              </li>
            ))}
          </ol>
          <p className="text-center text-sm text-white/70 mt-8">
            You never pay online, and you never pay before we have talked.
          </p>
        </div>
      </section>

      <AdSlot placement="home_hero" className="mt-10" />

      {/* Shop by brand — brand pages are what people find on Google ("Nike Ethiopia") */}
      {topBrands.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SectionTitle
            en="Shop by Brand"
            sub={amharic ? 'በብራንድ ይግዙ' : 'Brand-n bitadhaa'}
            amharic={amharic}
            action={
              <Link to="/brands" className="text-xs font-bold uppercase tracking-wider text-ink hover:text-sale no-underline inline-flex items-center gap-1 shrink-0">
                All brands <ArrowRight size={12} />
              </Link>
            }
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {topBrands.map((b) => (
              <Link
                key={b.slug}
                to={`/brands/${b.slug}`}
                className="border border-gray-200 bg-white px-4 py-5 text-center no-underline hover:border-ink transition-colors"
              >
                <p className="font-extrabold uppercase tracking-wider text-ink text-sm">{b.name}</p>
                <p className="text-[11px] text-ink-muted mt-1">
                  {b.product_count} {b.product_count === 1 ? 'item' : 'items'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Shop by category — same style for every tile */}
      {tree.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <SectionTitle en="Shop by Category" sub={amharic ? 'በምድብ ይግዙ' : 'Gosaan bitadhaa'} amharic={amharic} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tree.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group bg-gray-100 px-5 py-6 no-underline flex items-center justify-between hover:bg-ink transition-colors"
              >
                <span>
                  <span className="block font-extrabold uppercase tracking-wider text-ink group-hover:text-white">
                    {cat.name_en}
                  </span>
                  <Sub amharic={amharic} className="text-xs text-ink-muted group-hover:text-white/70 mt-0.5">
                    {catLocal(cat, lang)}
                  </Sub>
                </span>
                <ArrowRight size={18} className="text-ink group-hover:text-white" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <AdSlot placement="home_strip" className="pb-12" />

      {/* Guarantee + contact */}
      <section className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <ShieldCheck size={36} className="text-sale" />
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink mt-3">
              If anything goes wrong, it is on us.
              <Sub amharic={amharic} className="text-sm md:text-base font-medium text-ink-muted mt-1">
                {amharic ? 'ማንኛውም ችግር ቢፈጠር ኃላፊነቱ የእኛ ነው።' : 'Rakkoon kamiyyuu yoo uumame, itti gaafatamummaan kan keenya.'}
              </Sub>
            </h2>
            <p className="text-ink-soft mt-4 max-w-lg">
              Wrong size, damaged item or a late delivery — call us and we make it right at no extra cost to
              you. You only pay {DEPOSIT_PERCENT}% before delivery, so most of your money stays with you until
              you have the item in your hands.
            </p>
          </div>
          <div className="bg-white border border-gray-200 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Talk to us</p>
            <div className="mt-3 divide-y divide-gray-100">
              {CONTACTS.map((c) => (
                <a key={c.tel} href={`tel:${c.tel}`} className="flex items-center gap-4 py-4 no-underline group">
                  <span className="w-11 h-11 rounded-full bg-ink text-white flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </span>
                  <span>
                    <span className="block text-xs text-ink-muted">{c.label}</span>
                    <span className="block text-lg font-bold text-ink group-hover:underline">{c.display}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — also marked up for Google */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <SectionTitle en="Questions & Answers" sub={amharic ? 'ጥያቄና መልስ' : 'Gaaffii fi deebii'} amharic={amharic} />
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                <span>
                  <span className="block font-bold text-ink">{item.q}</span>
                  <Sub amharic={amharic} className="text-xs text-ink-muted mt-0.5">{local(item, lang)}</Sub>
                </span>
                <ChevronDown size={18} className="shrink-0 mt-1 transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-sm text-ink-soft mt-3 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* An empty catalogue shows a neutral message (never admin links). */}
      {!loadError && !categoriesLoading && categories.length === 0 && (
        <section className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-sm text-ink-muted">New products are coming soon. Please check back shortly.</p>
        </section>
      )}
    </>
  );
}
