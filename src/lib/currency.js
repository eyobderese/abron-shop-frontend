export const DEFAULT_CURRENCY = 'ETB';

export const PRODUCT_CURRENCIES = [
  { code: 'ETB', label: 'ETB — Ethiopian Birr' },
  { code: 'USD', label: 'USD — US Dollar' },
];

const supportedCurrencies = new Set(
  PRODUCT_CURRENCIES.map(({ code }) => code)
);

export function productCurrency(product) {
  return supportedCurrencies.has(product?.currency)
    ? product.currency
    : DEFAULT_CURRENCY;
}

export function formatMoney(value, currency = DEFAULT_CURRENCY) {
  const amount = Number(value);
  const code = supportedCurrencies.has(currency)
    ? currency
    : DEFAULT_CURRENCY;

  if (!Number.isFinite(amount)) return '';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    currencyDisplay: 'code',
  }).format(amount);
}
