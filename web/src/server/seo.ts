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
    title: 'wondering — agentic memory built with CockroachDB and AWS',
    description:
      'A CockroachDB × AWS Hackathon voice agent that remembers buyers, retrieves relevant homes with distributed vector search, and acts on persistent context.',
  },
} as const;

function getOrganizationJsonLd(): object {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: 'An agentic-memory voice application built with CockroachDB, AWS, and OpenAI.',
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
    description: 'AI voice agent that uses CockroachDB as persistent memory to recall buyer context and act on it.',
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
  description: 'An AI voice agent with CockroachDB-backed persistent and semantic memory.',
  brand: { '@type': 'Brand', name: 'wondering' },
  url: SITE_URL,
};

const FAQ_LD = {
  '@type': 'FAQPage',
  mainEntity: [
    ['Why CockroachDB?', 'It keeps operational state and semantic vector memory in one resilient source of truth.'],
    ['Which challenge tools are used?', 'CockroachDB Distributed Vector Indexing and the agent-ready ccloud CLI.'],
    ['What does the agent remember?', 'Buyer identity, preferences, previous conversations, listing matches, and showing state.'],
    ['Where does it run?', 'The application runs on AWS in ap-south-1 and connects to CockroachDB Cloud.'],
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
