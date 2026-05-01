import type { Metadata } from "next";
import PartnerMarquee from "@/components/sections/PartnerMarquee";
import Button from "@/components/ui/Button";
import StatCounterClient from "@/components/ui/StatCount/StateCountClient";

export const metadata: Metadata = {
  title: "Parceiros | Centro Dia Pessoa com Deficiência — Projeto Casulo",
  description:
    "Conheça as empresas e instituições que apoiam o Centro Dia da Pessoa com Deficiência em Bragança Paulista. Juntos promovemos inclusão, autonomia e dignidade.",
  keywords: [
    "parceiros Centro Dia",
    "apoio inclusão social",
    "deficiência intelectual",
    "Projeto Casulo",
    "Bragança Paulista",
    "empresas parceiras",
    "responsabilidade social",
  ],
  alternates: {
    canonical: "https://www.projetocasulo.org.br/parceiros",
  },
  openGraph: {
    title: "Parceiros | Centro Dia Pessoa com Deficiência — Projeto Casulo",
    description:
      "Empresas e instituições que acreditam no trabalho do Centro Dia e caminham com a gente na promoção da inclusão em Bragança Paulista.",
    url: "https://www.projetocasulo.org.br/parceiros",
    siteName: "Projeto Casulo",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://www.projetocasulo.org.br/og/parceiros.jpg",
        width: 1200,
        height: 630,
        alt: "Parceiros do Centro Dia Pessoa com Deficiência — Projeto Casulo",
      },
    ],
  },
};

const partners = [
  { name: "Apoio Social", src: "/parceiros/apoio-social.svg", bgColor: "#ffffff" },
  { name: "Casa do Pintor", src: "/parceiros/casa-do-pintor.svg", bgColor: "#ffffff" },
  { name: "Damatsu", src: "/parceiros/damatsu.svg", bgColor: "#ffffff" },
  { name: "Giorgino", src: "/parceiros/giorgino.svg", bgColor: "#212121" },
  { name: "José Paulino", src: "/parceiros/jose-paulino.svg", bgColor: "#ffffff" },
  { name: "Makino", src: "/parceiros/makino.svg", bgColor: "#ffffff" },
  { name: "Marcus Bonna", src: "/parceiros/marcus-bonna.svg", bgColor: "#ffffff" },
  { name: "Musical Tassara", src: "/parceiros/musical-tassara.svg", bgColor: "#000000" },
  { name: "Parque Brasil", src: "/parceiros/parque-brasil.svg", bgColor: "#ffffff" },
  { name: "Policog", src: "/parceiros/policog.svg", bgColor: "#000000" },
  { name: "Primeira Impressão", src: "/parceiros/primeira-impressao.svg", bgColor: "#4A5672" },
  { name: "Probac", src: "/parceiros/probac.svg", bgColor: "#000000" },
  { name: "Woodpel", src: "/parceiros/woodpel.svg", bgColor: "#ffffff" },
];

export default function Parceiros() {
  return (
    <main className="flex flex-col justify-between h-full py-8">
      <section aria-labelledby="partners-heading">
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-15 flex items-end justify-between gap-8">
          <div className="space-y-2">
            <p className="text-primary font-bold text-sm tracking-widest uppercase">
              Quem caminha com a gente
            </p>
            <h1
              id="partners-heading"
              className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight"
            >
              Nossos parceiros
            </h1>
            <p className="text-gray-600">
              Empresas e instituições que acreditam no nosso trabalho
            </p>
          </div>

          <div className="text-right shrink-0 text-gray-800/60">
            <StatCounterClient value={13} label="Parceiros ativos" />
          </div>
        </div>
      </section>

      <PartnerMarquee partners={partners} />

      <section aria-label="Seja um parceiro" className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 mt-10 pt-10 pb-15 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-700 font-medium text-md md:text-lg max-w-xl">
            Quer apoiar o Centro Dia e fazer parte desta rede de parceiros?
          </p>
          <Button href="/contato" text="Seja um parceiro" variant="primary" />
        </div>
      </section>
    </main>
  );
}
