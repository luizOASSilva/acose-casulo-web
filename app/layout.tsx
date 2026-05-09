import type { Metadata } from 'next';
import { Open_Sans, Montserrat } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layouts/Navbar/Navbar';
import Footer from '@/components/layouts/Footer';

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
  display: 'block',
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  display: 'block',
});

export const metadata: Metadata = {
  title: {
    default: 'Acose Casulo | Centro Dia | Bragança Paulista',
    template: '%s | Acose Casulo',
  },
  description:
    'Centro Dia da Pessoa com Deficiência - Acose Casulo oferece acolhimento, autonomia e dignidade para jovens adultos com deficiência em Bragança Paulista, SP.',
  keywords: [
    'centro dia',
    'pessoa com deficiência',
    'deficiência intelectual',
    'Bragança Paulista',
    'inclusão social',
    'Projeto Casulo',
    'Acose',
    'jovens adultos',
    'acolhimento',
    'CDPD',
  ],
  authors: [{ name: 'Acose Casulo' }],
  creator: 'Acose Casulo',
  publisher: 'Acose Casulo',
  metadataBase: new URL('https://acosecasulo.org.br'),
  openGraph: {
    title: 'Acose Casulo | Centro Dia | CDPD | Bragança Paulista',
    description:
      'Centro Dia da Pessoa com Deficiência - Acose Casulo oferece acolhimento, autonomia e dignidade para jovens adultos com deficiência em Bragança Paulista, SP.',
    url: 'https://acosecasulo.org.br',
    siteName: 'Acose Casulo',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/favicon.ico',
        width: 1200,
        height: 630,
        alt: 'Acose Casulo — Centro Dia da Pessoa com Deficiência',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              name: 'Acose Casulo',
              url: 'https://acosecasulo.org.br',
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
              description:
                'Centro Dia da Pessoa com Deficiência — acolhimento, autonomia e dignidade para jovens adultos com deficiência em Bragança Paulista, SP.',
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
