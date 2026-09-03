import { Link } from 'react-router-dom';
import Seo from '../../components/seo/Seo';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useCategories } from '../../hooks/useCategories';
import { catLabel } from '../../lib/i18n';
import { useLang } from '../../context/LanguageContext';

export default function CategoriesPage() {
  const { categories, loading } = useCategories();
  const { lang } = useLang();

  return (
    <>
      <Seo
        title="Shop All Categories"
        description="Browse all Abron Shop categories for authentic American brand products delivered to Ethiopia."
        path="/categories"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink">
            Shop All Categories
          </h1>
          <p className="text-sm text-ink-muted mt-2">
            Browse the complete Abron Shop catalog by category.
          </p>
        </header>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group relative aspect-square overflow-hidden bg-gray-100 no-underline"
              >
                {category.image_url && (
                  <img
                    src={category.image_url}
                    alt={category.name_en}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    {catLabel(category, lang)}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
