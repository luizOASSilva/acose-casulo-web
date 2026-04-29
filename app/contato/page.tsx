import type { Metadata } from "next";
import { ContactForm } from "@/components/form/ContactForm";
import { Clock, MapPin, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contato | Acose Casulo",
  description:
    "Entre em contato com nossa equipe. Respondemos todas as mensagens o mais rápido possível.",
  openGraph: {
    title: "Contato | Acose Casulo",
    description: "Fale com nossa equipe. Estamos prontos para ajudar.",
    type: "website",
  },
};

export default function Contato() {
  return (
    <main className="flex flex-col lg:flex-row min-h-screen">
      <section
        className="w-full lg:w-1/2 flex flex-col justify-center px-12 py-20 relative overflow-hidden"
        aria-labelledby="contact-info-heading"
      >
        <div aria-hidden="true" className="absolute top-10 right-10 w-32 h-32 rounded-full border border-primary/20" />
        <div aria-hidden="true" className="absolute top-16 right-16 w-20 h-20 rounded-full border border-primary/10" />
        <div aria-hidden="true" className="absolute bottom-20 left-6 w-48 h-48 rounded-full border border-gray-300/80" />
        <div aria-hidden="true" className="absolute bottom-30 left-16 w-28 h-28 rounded-full border border-gray-300/60" />
        <div aria-hidden="true" className="absolute top-1/2 -right-6 w-16 h-16 rounded-full bg-primary/5" />
        <div aria-hidden="true" className="absolute left-0 top-1/4 h-1/2 w-0.5 bg-linear-to-b from-transparent via-primary/30 to-transparent" />

        <div className="max-w-md w-full mx-auto space-y-10 relative z-10">
          <div className="space-y-3">
            <h1
              id="contact-info-heading"
              className="text-4xl font-bold text-gray-900 leading-tight"
            >
              Cuidar é o que fazemos. <br />
              <span className="text-primary">Fale com a gente.</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Seja para tirar dúvidas sobre o Centro Dia, apoiar nossa causa ou
              iniciar uma parceria — estamos aqui por quem mais precisa.
            </p>
          </div>

          <address className="not-italic space-y-7">
            <div className="flex flex-row items-start gap-4">
              <div className="p-3 rounded-full border border-gray-200 shrink-0 mt-0.5">
                <Clock size={20} aria-hidden="true" className="text-gray-500" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Atendimento</p>
                <p className="text-gray-700 text-sm">Segunda a Sexta-feira · 08h às 17h</p>
              </div>
            </div>

            <div className="flex flex-row items-start gap-4">
              <div className="p-3 rounded-full border border-gray-200 shrink-0 mt-0.5">
                <MapPin size={20} aria-hidden="true" className="text-gray-500" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Endereço</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Rua Francisco Rodrigues Dias, 80
                  <br />
                  Ub — Bragança Paulista/SP
                </p>
              </div>
            </div>

            <div className="flex flex-row items-start gap-4">
              <div className="p-3 rounded-full border border-gray-200 shrink-0 mt-0.5">
                <Mail size={20} aria-hidden="true" className="text-gray-500" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">E-mail</p>
                <a
                  href="mailto:contato@projetocasulobp.org.br"
                  className="text-primary text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  contato@projetocasulobp.org.br
                </a>
              </div>
            </div>

            <div className="flex flex-row items-start gap-4">
              <div className="p-3 rounded-full border border-gray-200 shrink-0 mt-0.5">
                <Phone size={20} aria-hidden="true" className="text-gray-500" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Telefone</p>
                <a
                  href="tel:+551124734994"
                  className="text-gray-700 text-sm hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  (11) 2473-4994
                </a>
              </div>
            </div>
          </address>

          <svg
            aria-hidden="true"
            viewBox="0 0 400 120"
            className="w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 60 Q50 10 100 60 T200 60 T300 60 T400 60"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1.5"
            />
            <path
              d="M0 75 Q50 25 100 75 T200 75 T300 75 T400 75"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeOpacity="0.35"
            />
            <path
              d="M0 90 Q50 40 100 90 T200 90 T300 90 T400 90"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          </svg>
        </div>
      </section>

      <section
        className="w-full lg:w-1/2 flex items-center justify-center flex-col bg-secondary px-8 py-20 gap-6"
        aria-labelledby="contact-form-heading"
      >
        <header className="text-center space-y-2">
          <h2
            id="contact-form-heading"
            className="text-white text-3xl font-bold tracking-tight"
          >
            Envie uma mensagem
          </h2>
          <p className="text-gray-300 text-sm">
            Respondemos o mais rápido possível
          </p>
        </header>

        <ContactForm />
      </section>
    </main>
  );
}