import type { Metadata } from 'next';

import '@fontsource-variable/open-sans';
import '@fontsource-variable/montserrat';

import './globals.css';

import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  OG_IMAGE,
} from '@/lib/config';

import { getPublicSettings } from '@/services/public-settings';

import { MotionProvider } from '@/components/providers/MotionProvider';
import { AuthProvider } from '@/context/AuthContext';
import GoogleAnalytics from '@/components/providers/GoogleAnalytics';

type PublicSettings = {
  site_logo_url?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;
  contact_address?: string | null;
  business_hours?: string | null;
  google_maps_embed_url?: string | null;
  google_maps_url?: string | null;
  location_title?: string | null;
  donation_enabled?: string | null;
  donation_message?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
};

function clean(value?: string | null): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function normalizePublicUrl(url?: string | null): string | null {
  const value = clean(url);

  if (!value) return null;

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:')
  ) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${SITE_URL}${value}`;
  }

  return `${SITE_URL}/${value}`;
}

function splitAddress(address?: string | null) {
  const fallback = {
    streetAddress: 'Rua Francisco Rodrigues Dias, 80',
    addressLocality: 'Bragança Paulista',
    addressRegion: 'SP',
    postalCode: '12908-843',
  };

  const value = clean(address);

  if (!value) return fallback;

  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const streetAddress = lines[0] || fallback.streetAddress;

  const fullText = lines.join(' ');

  const postalCodeMatch = fullText.match(/\d{5}-?\d{3}/);
  const postalCode = postalCodeMatch?.[0] || fallback.postalCode;

  const hasBraganca = /bragança paulista/i.test(fullText);
  const hasSP = /\/SP|SP\b/i.test(fullText);

  return {
    streetAddress,
    addressLocality: hasBraganca
      ? 'Bragança Paulista'
      : fallback.addressLocality,
    addressRegion: hasSP ? 'SP' : fallback.addressRegion,
    postalCode,
  };
}

async function getLayoutSettings(): Promise<PublicSettings | null> {
  try {
    return await getPublicSettings();
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getLayoutSettings();

  const logoUrl = normalizePublicUrl(settings?.site_logo_url);

  return {
    title: {
      default: `${SITE_NAME} | Centro Dia | Bragança Paulista`,
      template: `%s | ${SITE_NAME}`,
    },

    description: SITE_DESCRIPTION,

    authors: [{ name: SITE_NAME }],

    creator: SITE_NAME,

    publisher: SITE_NAME,

    metadataBase: new URL(SITE_URL),

    icons: {
      apple: '/apple-touch-icon.png',
    },

    other: {
      'theme-color': '#ffffff',
    },

    openGraph: {
      title: `${SITE_NAME} | Centro Dia | CDPD | Bragança Paulista`,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      type: 'website',
      images: logoUrl
        ? {
            url: logoUrl,
            width: 1200,
            height: 630,
            alt: `${SITE_NAME} — Centro Dia da Pessoa com Deficiência`,
          }
        : OG_IMAGE,
    },
  };
}

function buildNgoJsonLd(settings: PublicSettings | null) {
  const logoUrl = normalizePublicUrl(settings?.site_logo_url);
  const address = splitAddress(settings?.contact_address);

  const phone =
    clean(settings?.contact_phone) ||
    clean(settings?.contact_whatsapp) ||
    undefined;

  const email = clean(settings?.contact_email) || undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,

    ...(logoUrl
      ? {
          logo: logoUrl,
          image: logoUrl,
        }
      : {}),

    ...(phone
      ? {
          telephone: phone,
        }
      : {}),

    ...(email
      ? {
          email,
        }
      : {}),

    address: {
      '@type': 'PostalAddress',
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      postalCode: address.postalCode,
      addressCountry: 'BR',
    },

    ...(clean(settings?.business_hours)
      ? {
          openingHours: settings?.business_hours,
        }
      : {}),

    ...(clean(settings?.google_maps_url)
      ? {
          hasMap: settings?.google_maps_url,
        }
      : {}),

    sameAs: [
      clean(settings?.facebook_url),
      clean(settings?.instagram_url),
    ].filter(Boolean),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getLayoutSettings();

  const ngoJsonLd = buildNgoJsonLd(settings);

  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ngoJsonLd).replace(/</g, '\\u003c'),
          }}
        />
      </head>

      <body className="flex min-h-screen flex-col font-sans">
        <AuthProvider>
          <MotionProvider>{children}</MotionProvider>
        </AuthProvider>

        <GoogleAnalytics />
      </body>
    </html>
  );
}
