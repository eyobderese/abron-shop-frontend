// One place for the shop's promises and contact details, so the home page,
// footer, product page and search-engine data always say the same thing.
// Text is English first; `am` (Amharic) and `or` (Afaan Oromo) are shown underneath.

export const CONTACTS = [
  { label: 'Ethiopia', display: '+251 975 200 716', tel: '+251975200716' },
  { label: 'USA', display: '+1 (408) 921-3211', tel: '+14089213211' },
];

export const DEPOSIT_PERCENT = 20;
export const DELIVERY_DAYS = 7;

export const PROMISES = [
  {
    key: 'deposit',
    en: `Pay only ${DEPOSIT_PERCENT}% to order`,
    am: `ለማዘዝ ${DEPOSIT_PERCENT}% ብቻ ይክፈሉ`,
    or: `Ajajuuf %${DEPOSIT_PERCENT} qofa kaffalaa`,
    detailEn: `The other ${100 - DEPOSIT_PERCENT}% is paid when the item reaches you.`,
  },
  {
    key: 'delivery',
    en: `Delivered in about ${DELIVERY_DAYS} days`,
    am: `በ${DELIVERY_DAYS} ቀናት ውስጥ ይደርሳል`,
    or: `Guyyaa ${DELIVERY_DAYS} keessatti isin ga'a`,
    detailEn: 'Counted from the day you pay the deposit.',
  },
  {
    key: 'guarantee',
    en: 'Wrong size or damaged? It is on us',
    am: 'መጠኑ ካልሆነ ወይም ከተበላሸ ኃላፊነቱ የእኛ ነው',
    or: 'Safartuun yoo hin taane ykn yoo miidhame, nu irra jira',
    detailEn: 'We make it right at no extra cost to you.',
  },
  {
    key: 'original',
    en: 'Original American brands',
    am: 'ኦሪጂናል የአሜሪካ ብራንዶች',
    or: 'Brand Ameerikaa dhugaa',
    detailEn: 'Sourced in the USA and shipped to Ethiopia.',
  },
];

export const STEPS = [
  {
    en: 'Send an inquiry',
    am: 'ጥያቄ ይላኩ',
    or: 'Gaaffii ergaa',
    desc: 'Choose a product and leave your name, phone and Telegram. Nothing is paid online.',
  },
  {
    en: 'We call you',
    am: 'እንደውልልዎታለን',
    or: 'Ni bilbilla',
    desc: 'We agree with you by phone on the price, size, color and delivery date.',
  },
  {
    en: `Pay ${DEPOSIT_PERCENT}% deposit`,
    am: `${DEPOSIT_PERCENT}% ቀብድ ይክፈሉ`,
    or: `Qabsiisa %${DEPOSIT_PERCENT} kaffalaa`,
    desc: `Only after everything is agreed, you pay ${DEPOSIT_PERCENT}% so we can order it in the USA.`,
  },
  {
    en: 'Receive, then pay the rest',
    am: 'ተቀብለው ቀሪውን ይክፈሉ',
    or: 'Fudhaatii hafe kaffalaa',
    desc: `It arrives in about ${DELIVERY_DAYS} days. You check it, then pay the remaining ${100 - DEPOSIT_PERCENT}%.`,
  },
];

export const FAQ = [
  {
    q: 'Are the products original?',
    am: 'ዕቃዎቹ ኦሪጂናል ናቸው?',
    or: 'Meeshaaleen dhugaa dha?',
    a: 'Yes. We sell original American brands such as Nike, New Balance and Skechers. Every item is sourced in the USA and shipped to Ethiopia.',
  },
  {
    q: 'How do I pay?',
    am: 'እንዴት ነው የምከፍለው?',
    or: 'Akkamitti kaffala?',
    a: `There is no online payment. After we agree on everything by phone, you pay a ${DEPOSIT_PERCENT}% deposit. You pay the remaining ${100 - DEPOSIT_PERCENT}% when the item is delivered to you.`,
  },
  {
    q: 'Do I pay anything before you call me?',
    am: 'ከመደወላችሁ በፊት መክፈል አለብኝ?',
    or: 'Osoo hin bilbilin dura kaffaluun qaba?',
    a: 'No. Sending an inquiry is free. You pay nothing until we have talked and you agree.',
  },
  {
    q: 'How long does delivery take?',
    am: 'ለማድረስ ስንት ቀን ይወስዳል?',
    or: "Geessuun guyyaa meeqa fudhata?",
    a: `About ${DELIVERY_DAYS} days from the day you pay the deposit.`,
  },
  {
    q: 'What if the size is wrong or the item is damaged?',
    am: 'መጠኑ ካልሆነ ወይም ዕቃው ከተበላሸ ምን ይሆናል?',
    or: 'Safartuun yoo hin taane ykn meeshaan yoo miidhame hoo?',
    a: 'That is on us. Contact us and we will make it right at no extra cost to you.',
  },
  {
    q: 'How can I contact you?',
    am: 'እንዴት ላገኛችሁ እችላለሁ?',
    or: 'Akkamitti isin argachuu danda’a?',
    a: `Call us in Ethiopia on ${CONTACTS[0].display} or in the USA on ${CONTACTS[1].display}. If anything happens, contact us.`,
  },
];

export function local(item, lang) {
  return lang === 'or' ? item.or : item.am;
}

/** Search-engine data describing the shop (used on the home page). */
export function storeSchema(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'Abron Shop',
    alternateName: 'አብሮን ሱቅ',
    url: siteUrl,
    logo: `${siteUrl}/brand-icon-512.png`,
    description:
      'Original American shoes, clothing and perfume delivered in Ethiopia. Pay 20% to order and the rest on delivery.',
    areaServed: { '@type': 'Country', name: 'Ethiopia' },
    telephone: CONTACTS[0].tel,
    contactPoint: CONTACTS.map((c) => ({
      '@type': 'ContactPoint',
      telephone: c.tel,
      contactType: 'customer service',
      areaServed: c.label === 'USA' ? 'US' : 'ET',
      availableLanguage: ['English', 'Amharic'],
    })),
  };
}

export function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
