// Accepts either a joined category row { name_en, name_am, slug } or a raw
// string (legacy products that still have only the text `category` column).
export default function CategoryBadge({ category }) {
  if (!category) return null;

  let label;
  if (typeof category === 'string') {
    label = category;
  } else {
    label = category.name_am
      ? `${category.name_en} · ${category.name_am}`
      : category.name_en;
  }

  return (
    <span className="inline-block px-2 py-0.5 bg-gray-100 text-ink text-[11px] font-medium uppercase tracking-wide">
      {label}
    </span>
  );
}
