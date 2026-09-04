import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { catLabel, dict } from '../../lib/i18n';
import { useLang } from '../../context/LanguageContext';
import BrandLogo from '../ui/BrandLogo';

export default function Footer() {
  const { tree } = useCategories();
  const topCats = tree.slice(0, 4);
  const { lang } = useLang();
  const d = dict(lang);
  const amharic = lang !== 'or';

  return (
    <footer className="bg-ink text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link
              to="/"
              aria-label="Abron Shop home"
              className="inline-flex bg-white rounded-md px-2 py-1 mb-3 no-underline"
            >
              <BrandLogo className="h-14 w-auto" />
            </Link>
            <p
              className={`text-xs text-gray-300 leading-relaxed ${
                amharic ? 'font-amharic' : ''
              }`}
            >
              {d.tagline}.{' '}
              {amharic
                ? 'ከአሜሪካ ቀጥታ ወደ ኢትዮጵያ የሚመጡ ኦሪጂናል የሞዴል ዕቃዎች።'
                : 'Meeshaalee dhugaa Ameerikaa irraa kallattiin Itoophiyaa dhufan.'}
            </p>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Authentic American brands delivered to Ethiopia. Browse, inquire,
              and we handle sourcing + shipping.
            </p>
          </div>

          {topCats.map((cat) => (
            <div key={cat.id}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3">
                {catLabel(cat, lang)}
              </h3>
              <ul className="space-y-1.5">
                {(cat.children?.length ? cat.children : [cat])
                  .slice(0, 6)
                  .map((child) => (
                    <li key={child.id}>
                      <Link
                        to={`/category/${child.slug}`}
                        className="text-xs text-gray-300 hover:text-white hover:underline no-underline"
                      >
                        {catLabel(child, lang)}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Abron Shop · {d.brandFull}.{' '}
            <span className={amharic ? 'font-amharic' : ''}>
              {d.copyright}
            </span>
            .
          </p>
          <p className="flex items-center gap-2">
            <span>🇺🇸 USA</span>
            <span>→</span>
            <span>🇪🇹 Ethiopia</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
