const SITE_URL = 'https://superrealty.mahimai.ca';
const SITE_NAME = 'wondering';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

export interface RouteMeta {
  title: string;
  description: string;
  ogImage?: string;
}

const ROUTE_META = {
  '/': {
    title: 'wondering: turn missed calls into booked showings',
    description:
      'An AI buyer concierge that answers inquiries, qualifies leads, recommends relevant homes, remembers every conversation, and books showings.',
  },
} as const;

function getOrganizationJsonLd(): object {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: 'An AI buyer concierge that turns missed real estate inquiries into informed conversations and booked showings.',
    sameAs: [
      'https://www.linkedin.com/in/mahimairaja',
      'https://github.com/mahimairaja',
      'https://x.com/mahimaidev',
    ],
    founder: {
      '@type': 'Person',
      name: 'Mahimai Raja J',
      url: 'https://mahimai.ca',
    },
  };
}

function getWebSiteJsonLd(): object {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'en',
    publisher: { '@id': ORG_ID },
  };
}

function getServiceJsonLd(): object {
  return {
    '@type': 'ProfessionalService',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'AI buyer concierge that answers calls, understands buyer needs, recommends homes, and books showings.',
    provider: {
      '@type': 'Person',
      name: 'Mahimai Raja J',
      url: 'https://mahimai.ca',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'AI voice receptionist for real estate',
            description:
              'An AI agent that answers every buyer inquiry in your name, qualifies the lead, books the showing, and remembers every caller.',
          },
        },
      ],
    },
  };
}

const PRODUCT_LD = {
  '@type': 'Product',
  name: 'wondering',
  description: 'An AI buyer concierge that remembers every conversation and helps agents turn inquiries into showings.',
  brand: { '@type': 'Brand', name: 'wondering' },
  url: SITE_URL,
};

const FAQ_LD = {
  '@type': 'FAQPage',
  mainEntity: [
    ['Will it sound robotic?', 'No. The assistant listens, responds naturally, and asks useful follow-up questions.'],
    ['Can it make up a listing?', 'No. Recommendations are grounded in the listings connected to the agent workspace.'],
    ['What happens when a buyer calls again?', 'wondering continues from saved preferences and previous conversations.'],
    ['When does the human agent step in?', 'The agent receives the full buyer profile, call outcome, matches, and showing details.'],
  ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};

function buildJsonLd(pathname: string): string {
  const graph: object[] = [getWebSiteJsonLd(), getOrganizationJsonLd()];

  if (pathname === '/') {
    graph.push(getServiceJsonLd(), PRODUCT_LD, FAQ_LD);
  }

  const ld = { '@context': 'https://schema.org', '@graph': graph };
  return JSON.stringify(ld);
}

/** Always returns one absolute canonical URL. Strips query strings. Used by getPageSeo(). */
export function getCanonicalUrl(pathname: string): string {
  const pathOnly = pathname.split('?')[0]!.split('#')[0]!;
  if (pathOnly === '/') return SITE_URL;
  const normalized = pathOnly.replace(/\/+$/, '');
  return `${SITE_URL}${normalized}`;
}

export function isKnownRoute(pathname: string): boolean {
  return (ROUTE_META as Record<string, unknown>)[pathname] != null;
}

export interface PageSeo {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  ogImageAlt: string;
  ogType: 'website' | 'article';
  jsonLd: string;
  known: boolean;
}

/**
 * Structured per-route meta consumed natively by Layout.astro. Unknown routes
 * are soft-404: noindex with a root canonical.
 */
export function getPageSeo(pathname: string): PageSeo {
  const known = isKnownRoute(pathname);
  const meta = (ROUTE_META as Record<string, RouteMeta>)[pathname] ?? (ROUTE_META as Record<string, RouteMeta>)['/']!;
  return {
    title: meta.title,
    description: meta.description,
    canonical: known ? getCanonicalUrl(pathname) : SITE_URL,
    ogImage: meta.ogImage ?? DEFAULT_OG_IMAGE,
    ogImageAlt: `${meta.title} cover image`,
    ogType: 'website',
    jsonLd: buildJsonLd(pathname),
    known,
  };
}
