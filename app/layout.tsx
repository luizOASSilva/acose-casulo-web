import type { Metadata } from 'next';
import { Open_Sans, Montserrat } from 'next/font/google';
import './globals.css';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, OG_IMAGE } from '@/lib/config';

import { MotionProvider } from '@/components/providers/MotionProvider';

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
});

export const metadata: Metadata = {
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
    images: OG_IMAGE,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${openSans.variable} ${montserrat.variable} antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'NGO',
              name: SITE_NAME,
              url: SITE_URL,
              telephone: '+551124734994',
              email: 'contato@projetocasulobp.org.br',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Rua Francisco Rodrigues Dias, 80',
                addressLocality: 'Bragança Paulista',
                addressRegion: 'SP',
                postalCode: '12908-843',
                addressCountry: 'BR',
              },
              description: SITE_DESCRIPTION,
            }),
          }}
        />
      </head>

      <body className="min-h-screen flex flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
