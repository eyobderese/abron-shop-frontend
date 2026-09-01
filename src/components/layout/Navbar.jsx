import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { LOCALES, catLabel, dict } from '../../lib/i18n';
import { useLang } from '../../context/LanguageContext';

function LangSwitcher({ className = '' }) {
  const { lang, setLang } = useLang();
  return (
    <label className={`inline-flex items-center gap-1 text-[11px] ${className}`}>
      <span className="sr-only">Language</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label="Language"
        className="bg-transparent border border-white/30 text-white px-1.5 py-0.5 focus:outline-none focus:border-white cursor-pointer"
      >
        <option value="am" className="text-black">
          {LOCALES.am.label} (AM)
        </option>
        <option value="or" className="text-black">
          {LOCALES.or.label} (OR)
        </option>
      </select>
    </label>
  );
}

function SearchForm({ initial = '', onSubmitted, mobile = false }) {
  const [q, setQ] = useState(initial);
  const navigate = useNavigate();
  const { lang } = useLang();
  const d = dict(lang);
  const onSubmit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
    onSubmitted?.();
  };
  return (
    <form onSubmit={onSubmit} className="relative w-full" role="search">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={
          mobile ? `Search · ${d.search}…` : `Search products · ${d.search}…`
        }
        className="w-full border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-ink"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
      >
        <Search size={16} />
      </button>
    </form>
  );
}

function MegaMenu({ node, lang }) {
  // Group grandchildren under each child column.
  const columns = node.children?.length ? node.children : [];

  return (
    <div className="absolute left-0 right-0 top-full hidden group-hover:block group-focus-within:block bg-white border-t border-gray-100 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col.id}>
              <Link
                to={`/category/${col.slug}`}
                className="block text-sm font-bold uppercase tracking-wider text-ink hover:text-sale mb-3 no-underline"
              >
                {catLabel(col, lang)}
              </Link>
              {col.children?.length > 0 && (
                <ul className="space-y-1.5">
                  {col.children.map((leaf) => (
                    <li key={leaf.id}>
                      <Link
                        to={`/category/${leaf.slug}`}
                        className="text-sm text-ink-soft hover:text-sale hover:underline no-underline"
                      >
                        {catLabel(leaf, lang)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {columns.length === 0 && (
            <div className="col-span-4">
              <Link
                to={`/category/${node.slug}`}
                className="text-sm text-ink-soft hover:underline"
              >
                Shop all {catLabel(node, lang)}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileTreeItem({ node, onClose, lang, depth = 0 }) {
  const [open, setOpen] = useState(false);
  const hasKids = node.children?.length > 0;

  return (
    <div>
      <div
        className="flex items-center justify-between"
        style={{ paddingLeft: depth * 12 }}
      >
        <Link
          to={`/category/${node.slug}`}
          onClick={onClose}
          className="flex-1 block py-2 text-sm text-ink no-underline"
        >
          {catLabel(node, lang)}
        </Link>
        {hasKids && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 text-ink-muted"
            aria-label="Toggle subcategories"
          >
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>
      {hasKids && open && (
        <div className="border-l border-gray-100 ml-3">
          {node.children.map((child) => (
            <MobileTreeItem
              key={child.id}
              node={child}
              onClose={onClose}
              lang={lang}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { tree } = useCategories();
  const { lang } = useLang();
  const d = dict(lang);

  const topBarAmharic = '🇺🇸 → 🇪🇹 ከአሜሪካ ወደ ኢትዮጵያ — ቀጥታ ዕቃ';
  const topBarOromo = '🇺🇸 → 🇪🇹 USA → Itoophiyaa — Kallattiin';

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Top utility bar */}
      <div className="bg-ink text-white text-[11px] tracking-wider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
          <span className={lang === 'or' ? '' : 'font-amharic'}>
            {lang === 'or' ? topBarOromo : topBarAmharic}
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">
              Browse · Inquire · We handle the rest
            </span>
            <LangSwitcher />
          </div>
        </div>
      </div>

      {/* Main nav row */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link
              to="/"
              className="flex items-baseline gap-2 no-underline shrink-0"
            >
              <span className="text-xl md:text-2xl font-extrabold tracking-tight text-ink">
                ABRON
              </span>
              <span
                className={`text-lg md:text-xl font-bold text-sale ${
                  lang === 'or' ? '' : 'font-amharic'
                }`}
              >
                {d.brand}
              </span>
            </Link>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-xl">
              <SearchForm />
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/category/clearance"
                className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-sale hover:underline"
              >
                {d.sale}
              </Link>
              <button
                className="md:hidden p-2 text-ink"
                onClick={() => setOpen(!open)}
                aria-label="Menu"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Desktop category row with mega menus */}
          <nav className="hidden md:flex items-center gap-2 h-12 -mx-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-semibold uppercase tracking-wider no-underline ${
                  isActive ? 'text-sale' : 'text-ink hover:text-sale'
                }`
              }
            >
              {d.home}
            </NavLink>
            {tree.map((cat) => {
              const local = lang === 'or' ? cat.name_or : cat.name_am;
              return (
                <div key={cat.id} className="group static">
                  <NavLink
                    to={`/category/${cat.slug}`}
                    className={({ isActive }) =>
                      `px-3 py-2 text-sm font-semibold uppercase tracking-wider no-underline inline-block ${
                        isActive ? 'text-sale' : 'text-ink hover:text-sale'
                      }`
                    }
                  >
                    {cat.name_en}
                    {local && (
                      <span
                        className={`ml-1 font-normal text-ink-muted ${
                          lang === 'or' ? '' : 'font-amharic'
                        }`}
                      >
                        · {local}
                      </span>
                    )}
                  </NavLink>
                  {cat.children?.length > 0 && (
                    <MegaMenu node={cat} lang={lang} />
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-3">
            <div className="mb-3">
              <SearchForm mobile onSubmitted={() => setOpen(false)} />
            </div>
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-semibold uppercase tracking-wider text-ink no-underline"
            >
              Home · {d.home}
            </Link>
            {tree.map((cat) => (
              <MobileTreeItem
                key={cat.id}
                node={cat}
                onClose={() => setOpen(false)}
                lang={lang}
              />
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
