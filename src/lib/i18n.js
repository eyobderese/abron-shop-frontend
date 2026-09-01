// Tri-lingual helper. The site always shows English, paired with either
// Amharic (አማርኛ) or Afaan Oromo (Afaan Oromoo), selectable via the top-bar
// language dropdown (see LanguageContext).

export const LOCALES = {
  am: { code: 'am', label: 'አማርኛ', short: 'AM' },
  or: { code: 'or', label: 'Afaan Oromoo', short: 'OR' },
};

export const AM = {
  brand: 'አብሮን',
  brandFull: 'አብሮን ሱቅ',
  tagline: 'የኢትዮጵያ የመስመር ላይ ገበያ',
  shopNow: 'አሁን ይግዙ',
  shopWomen: 'ሴቶች',
  shopMen: 'ወንዶች',
  browse: 'ይመልከቱ',
  inquire: 'ጥያቄ ያቅርቡ',
  expressInterest: 'ፍላጎትዎን ያሳውቁ',
  interested: 'ይህን ምርት ይፈልጋሉ?',
  fullName: 'ሙሉ ስም',
  phone: 'ስልክ ቁጥር',
  telegram: 'ቴሌግራም',
  message: 'መልእክት',
  send: 'ላክ',
  home: 'መነሻ',
  categories: 'ምድቦች',
  allCategories: 'ሁሉም ምድቦች',
  newArrivals: 'አዲስ የገቡ',
  shopByCategory: 'በምድብ ይግዙ',
  featured: 'ተመራጭ',
  deals: 'ቅናሾች',
  clearance: 'ቅናሽ',
  upTo: 'እስከ',
  off: 'ቅናሽ',
  viewAll: 'ሁሉንም ይመልከቱ',
  filter: 'አጣራ',
  priceRange: 'የዋጋ ክልል',
  inStock: 'በክምችት አለ',
  outOfStock: 'ተጠናቋል',
  description: 'መግለጫ',
  backTo: 'ወደ',
  noProducts: 'ምንም ምርት የለም',
  search: 'ፈልግ',
  contact: 'ያግኙን',
  about: 'ስለ እኛ',
  help: 'እርዳታ',
  copyright: 'መብቱ በሕግ የተጠበቀ ነው',
  sale: 'ቅናሽ',
  productViews: 'የምርት መልክ',
  view_front: 'ፊት',
  view_back: 'ጀርባ',
  view_side: 'ጎን',
  view_detail: 'ዝርዝር',
  view_lifestyle: 'በአጠቃቀም',
  view_other: 'ሌላ',
};

export const OR = {
  brand: 'Abroon',
  brandFull: 'Suuqii Abroon',
  tagline: 'Gabaa Interneetii Itoophiyaa',
  shopNow: 'Amma Bitadhu',
  shopWomen: 'Dubartoota',
  shopMen: 'Dhiira',
  browse: 'Ilaali',
  inquire: 'Gaafadhu',
  expressInterest: 'Fedhii Kee Ibsuu',
  interested: 'Oomisha kana ni barbaaddaa?',
  fullName: 'Maqaa Guutuu',
  phone: 'Lakkoofsa Bilbilaa',
  telegram: 'Teleegiraamii',
  message: 'Ergaa',
  send: 'Ergi',
  home: 'Fuula Jalqabaa',
  categories: 'Gosa',
  allCategories: 'Gosoota Hunda',
  newArrivals: 'Haaraa Dhufan',
  shopByCategory: 'Gosaan Bitadhu',
  featured: 'Filatamaa',
  deals: 'Hirʼisaawwan',
  clearance: 'Hirʼisa',
  upTo: 'Hamma',
  off: 'Hirʼisa',
  viewAll: 'Hunda Ilaali',
  filter: 'Calaluu',
  priceRange: 'Hamma Gatii',
  inStock: 'Kuusaa Jira',
  outOfStock: 'Dhumeera',
  description: 'Ibsa',
  backTo: 'Gara',
  noProducts: 'Oomishni Hin Jiru',
  search: 'Barbaadi',
  contact: 'Nu Qunnamaa',
  about: 'Waaʼee Keenya',
  help: 'Gargaarsa',
  copyright: 'Mirgi Seeraan Eegameera',
  sale: 'Hirʼisa',
  productViews: 'Mulʼata Oomishaa',
  view_front: 'Fuuldura',
  view_back: 'Dugda',
  view_side: 'Gara',
  view_detail: 'Balʼina',
  view_lifestyle: 'Fayyadama',
  view_other: 'Kan Biroo',
};

// Returns the active non-English dictionary for the given lang code.
export function dict(lang) {
  return lang === 'or' ? OR : AM;
}

// Pair helper: renders English with its translation in the active lang.
// Usage: t('Shop Now', lang) → "Shop Now · አሁን ይግዙ"  (am)
//                         → "Shop Now · Amma Bitadhu" (or)
export function t(en, lang, key) {
  const d = dict(lang);
  const translated = key ? d[key] : null;
  if (!translated) return en;
  return `${en} · ${translated}`;
}

// Pick the localized value for a record with {base_en, base_am, base_or}-style
// fields. Falls back to English if the chosen lang value is missing.
export function pickLocal(row, baseField, lang) {
  if (!row) return '';
  const en = row[baseField];
  const key = lang === 'or' ? `${baseField}_or` : `${baseField}_am`;
  return row[key] || en || '';
}

// For a category record. English is always shown; the translation follows.
export function catLabel(cat, lang = 'am') {
  if (!cat) return '';
  const local = lang === 'or' ? cat.name_or : cat.name_am;
  if (local) return `${cat.name_en} · ${local}`;
  return cat.name_en;
}

// Returns just the localized (non-English) string, or '' if none set.
export function catLocal(cat, lang = 'am') {
  if (!cat) return '';
  return (lang === 'or' ? cat.name_or : cat.name_am) || '';
}

// Product helpers — English always wins for `name`/`description`; the
// translation is a secondary string to show alongside.
export function productLocalName(product, lang = 'am') {
  if (!product) return '';
  return (lang === 'or' ? product.name_or : product.name_am) || '';
}
export function productLocalDescription(product, lang = 'am') {
  if (!product) return '';
  return (
    (lang === 'or' ? product.description_or : product.description_am) || ''
  );
}
