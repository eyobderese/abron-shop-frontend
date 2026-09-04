import { Link } from 'react-router-dom';
import { ArrowRight, Plane, ShieldCheck, Package, MessageCircle } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/ui/ProductCard';
import AdSlot from '../../components/ui/AdSlot';
import { dict, catLocal } from '../../lib/i18n';
import { useLang } from '../../context/LanguageContext';
import Seo, { SITE_URL } from '../../components/seo/Seo';
import BrandLogo from '../../components/ui/BrandLogo';

function DealStrip({ lang }) {
  const d = dict(lang);
  const amharic = lang !== 'or';
  return (
    <div className="bg-sale text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-sm">
        <span className="font-bold uppercase tracking-wider">
          {d.upTo} 70% OFF
        </span>
        <span className="hidden sm:inline">·</span>
        <span className={amharic ? 'font-amharic' : ''}>
          {amharic
            ? 'ኦሪጂናል የአሜሪካ ብራንድ ዕቃዎች — ቅናሽ በሁሉም ምድብ'
            : 'Meeshaalee Brand Ameerikaa dhugaa — hirʼisa gosoota hundarratti'}
        </span>
        <Link
          to="/category/clearance"
          className="sm:ml-3 underline font-semibold"
        >
          Shop Clearance →
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { tree, categories } = useCategories();
  const { products } = useProducts({ limit: 24 });
  const { lang } = useLang();
  const d = dict(lang);
  const amharic = lang !== 'or';

  const featuredCats = tree.slice(0, 6);
  const preview = tree.slice(0, 3);
  const womenCat = categories.find((c) => c.slug === 'women');
  const menCat = categories.find((c) => c.slug === 'men');
  const description =
    'Shop authentic American brand shoes, clothing, beauty products and more, delivered from the USA to Ethiopia. Browse products and send an inquiry.';
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Abron Shop',
      url: SITE_URL,
      logo: `${SITE_URL}/brand-icon-512.png`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Abron Shop',
      alternateName: 'አብሮን ሱቅ',
      url: SITE_URL,
    },
  ];

  function shopCategoryBtnLabel(cat, enName, dictKey) {
    const local = catLocal(cat, lang) || dict(lang)[dictKey];
    return local ? `Shop ${enName} · ${local}` : `Shop ${enName}`;
  }

  function productsForCat(cat) {
    const ids = [cat.id];
    // Include direct children too, so the strip isn't empty when products
    // are assigned to leaves.
    const stack = [cat];
    while (stack.length) {
      const n = stack.pop();
      (n.children || []).forEach((c) => {
        ids.push(c.id);
        stack.push(c);
      });
    }
    return products.filter((p) => ids.includes(p.category_id)).slice(0, 4);
  }

  return (
    <>
      <Seo
        title="Abron Shop · Authentic American Brands Delivered to Ethiopia"
        description={description}
        path="/"
        jsonLd={structuredData}
      />
      <div>
      <DealStrip lang={lang} />

      {/* Hero */}
      <section className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="inline-block bg-ink text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 mb-4">
              🇺🇸 USA → 🇪🇹 Ethiopia · Direct
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink leading-[1.05]">
              Original American Brands,
              <br />
              <span className="text-sale">Delivered to Ethiopia.</span>
            </h1>
            {amharic ? (
              <p className="font-amharic text-xl md:text-2xl text-ink mt-4">
                ከአሜሪካ ቀጥታ የሚመጡ <span className="text-sale">ኦሪጂናል ዕቃዎች።</span>
              </p>
            ) : (
              <p className="text-xl md:text-2xl text-ink mt-4">
                Meeshaalee dhugaa Ameerikaa irraa{' '}
                <span className="text-sale">kallattiin dhufan.</span>
              </p>
            )}
            <p className="text-sm md:text-base text-ink-soft mt-4 max-w-lg">
              Browse, send an interest inquiry, and we handle sourcing, shipping
              and delivery — no online checkout needed.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                to="/category/women"
                className={`bg-ink text-white px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-black no-underline ${
                  amharic ? 'font-amharic' : ''
                }`}
              >
                {shopCategoryBtnLabel(womenCat, 'Women', 'shopWomen')}
              </Link>
              <Link
                to="/category/men"
                className={`bg-white border border-ink text-ink px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-50 no-underline ${
                  amharic ? 'font-amharic' : ''
                }`}
              >
                {shopCategoryBtnLabel(menCat, 'Men', 'shopMen')}
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] md:aspect-square bg-gradient-to-br from-eth-green/10 via-eth-yellow/10 to-eth-red/10 overflow-hidden flex items-center justify-center">
            <div className="text-center p-6 w-full">
              <div className="bg-white/90 rounded-xl shadow-sm px-5 py-6 mb-4 mx-auto max-w-lg">
                <BrandLogo className="w-full h-auto" loading="eager" />
              </div>
              <p
                className={`text-2xl font-bold text-ink ${
                  amharic ? 'font-amharic' : ''
                }`}
              >
                {d.brandFull}
              </p>
              <p
                className={`text-sm text-ink-soft mt-2 ${
                  amharic ? 'font-amharic' : ''
                }`}
              >
                {d.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero ad strip — sits above the category tiles */}
      <AdSlot placement="home_hero" className="mt-8" />

      {/* Category tiles */}
      {featuredCats.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-ink">
              Shop by Category ·{' '}
              <span className={amharic ? 'font-amharic' : ''}>
                {d.shopByCategory}
              </span>
            </h2>
            <Link
              to="/categories"
              className="text-xs font-bold uppercase tracking-wider text-ink hover:text-sale no-underline hidden sm:inline"
            >
              {d.viewAll} <ArrowRight size={12} className="inline" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {featuredCats.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group block bg-gray-100 aspect-square relative overflow-hidden no-underline"
              >
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name_en}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl">
                    {['👗', '👕', '👶', '👟', '👜', '💄', '🏠', '🏷️'][
                      featuredCats.indexOf(cat) % 8
                    ]}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white text-sm font-bold uppercase tracking-wider">
                    {cat.name_en}
                  </p>
                  {(() => {
                    const local = lang === 'or' ? cat.name_or : cat.name_am;
                    if (!local) return null;
                    return (
                      <p
                        className={`text-white/90 text-xs ${
                          amharic ? 'font-amharic' : ''
                        }`}
                      >
                        {local}
                      </p>
                    );
                  })()}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-white py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-bold text-ink text-center mb-2">
            How It Works ·{' '}
            <span className={amharic ? 'font-amharic' : ''}>
              {amharic ? 'እንዴት እንደሚሰራ' : 'Akkamitti Hojjeta'}
            </span>
          </h2>
          <p
            className={`text-sm text-ink-muted text-center mb-10 ${
              amharic ? 'font-amharic' : ''
            }`}
          >
            {amharic
              ? 'በሶስት ቀላል ደረጃዎች የሚወዱትን ዕቃ ያግኙ'
              : 'Tarkaanfii salphaa sadiin meeshaa jaallattan argadhaa'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Package,
                title: 'Browse',
                am: 'ይመልከቱ',
                or: 'Ilaali',
                desc: 'Explore authentic American brands across every category.',
              },
              {
                icon: MessageCircle,
                title: 'Inquire',
                am: 'ጥያቄ ይላኩ',
                or: 'Gaafadhu',
                desc: 'Leave your name, phone, and Telegram — no checkout required.',
              },
              {
                icon: Plane,
                title: 'We Ship',
                am: 'እኛ እንልካለን',
                or: 'Nuti Ergina',
                desc: 'We source from the USA and ship directly to Ethiopia.',
              },
              {
                icon: ShieldCheck,
                title: 'Receive',
                am: 'ይቀበሉ',
                or: 'Fudhadhu',
                desc: '100% authentic, delivered to your door.',
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ink text-white mb-4">
                  <step.icon size={26} />
                </div>
                <h3 className="font-bold uppercase tracking-wider text-ink text-sm">
                  {step.title}
                </h3>
                <p
                  className={`text-xs text-sale font-semibold mt-0.5 ${
                    amharic ? 'font-amharic' : ''
                  }`}
                >
                  {amharic ? step.am : step.or}
                </p>
                <p className="text-sm text-ink-soft mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inline ad — sits between editorial content and product strips */}
      <AdSlot placement="home_strip" className="py-8" />

      {/* Per-category product strips */}
      {preview.map((cat) => {
        const items = productsForCat(cat);
        if (items.length === 0) return null;
        return (
          <section
            key={cat.id}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
          >
            <div className="flex items-baseline justify-between mb-5 border-b border-gray-200 pb-2">
              <h2 className="text-lg md:text-xl font-bold text-ink">
                Latest in {cat.name_en}
                {(() => {
                  const local = lang === 'or' ? cat.name_or : cat.name_am;
                  if (!local) return null;
                  return (
                    <span
                      className={`text-ink-muted ml-2 font-normal ${
                        amharic ? 'font-amharic' : ''
                      }`}
                    >
                      · {local}
                    </span>
                  );
                })()}
              </h2>
              <Link
                to={`/category/${cat.slug}`}
                className="text-xs font-bold uppercase tracking-wider text-ink hover:text-sale no-underline inline-flex items-center gap-1"
              >
                {d.viewAll} <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}

      {categories.length === 0 && (
        <section className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-sm text-ink-muted">
            No categories yet. Log in as admin to create your first category.
          </p>
          <Link
            to="/admin/login"
            className="inline-block mt-4 text-sm font-bold uppercase tracking-wider text-ink underline"
          >
            Admin Login
          </Link>
        </section>
      )}
      </div>
    </>
  );
}
