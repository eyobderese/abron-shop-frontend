export const PRODUCT_SIZE_TYPES = [
  { value: 'NONE', label: 'No selectable size' },
  { value: 'SHOE_EU', label: 'Shoe sizes (EU)' },
  { value: 'CLOTHING', label: 'Clothing sizes' },
  { value: 'CUSTOM', label: 'Custom sizes' },
];

export const SHOE_EU_SIZES = Array.from({ length: 31 }, (_, index) =>
  String(index + 20),
);

export const CLOTHING_SIZES = [
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '3XL',
  '4XL',
];

export function sizeOptionsForType(sizeType) {
  if (sizeType === 'SHOE_EU') return SHOE_EU_SIZES;
  if (sizeType === 'CLOTHING') return CLOTHING_SIZES;
  return [];
}

export function cleanSizes(sizes) {
  if (!Array.isArray(sizes)) return [];
  return [...new Set(sizes.map((size) => String(size).trim()).filter(Boolean))];
}
