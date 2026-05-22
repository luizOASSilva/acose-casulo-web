'use client';

import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaYoutube,
} from 'react-icons/fa';

import { usePublicSettings } from '@/context/PublicSettingsContext';

function onlyDigits(value?: string | null): string {
  return value?.replace(/\D/g, '') ?? '';
}

function buildWhatsappUrl(value?: string | null): string | null {
  const digits = onlyDigits(value);

  if (!digits) return null;

  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;

  return `https://wa.me/${withCountry}?text=Olá%20vim%20pelo%20site`;
}

export default function Footer() {
  const { settings } = usePublicSettings();

  const businessHours =
    settings.business_hours || 'Segunda a sexta-feira\ndas 08h às 17h';

  const address =
    settings.contact_address ||
    'Rua Francisco Rodrigues Dias, 80\nUberaba — Bragança Paulista/SP\nCEP: 12908-843';

  const email = settings.contact_email || 'contato@projetocasulobp.org.br';
  const phone = settings.contact_phone || '(11) 2473-4994';

  const phoneDigits = onlyDigits(phone);
  const whatsappUrl = buildWhatsappUrl(settings.contact_whatsapp || phone);

  const instagramUrl = settings.instagram_url;
  const facebookUrl = settings.facebook_url;

  return (
    <footer className="bg-footer text-sm" aria-label="Rodapé do site">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 grid grid-cols-1 md:grid-cols-3 md:items-start md:justify-items-center gap-10">
        <div className="max-w-xs flex flex-col gap-3 text-left">
          <h2 className="font-semibold text-base text-gray-900">
            Projeto Casulo — Centro Dia da Pessoa com Deficiência
          </h2>

          <p className="text-gray-700">ONG • Bragança Paulista/SP</p>

          <p className="text-gray-700 leading-relaxed">
            Promovendo autonomia, inclusão e dignidade para jovens adultos com
            deficiência desde 2000.
          </p>
        </div>

        <div className="max-w-xs flex flex-col gap-3 text-left">
          <h2 className="font-semibold text-base text-gray-900">
            Horário de atendimento
          </h2>

          <p className="text-gray-700 whitespace-pre-line">
            {businessHours}
          </p>
        </div>

        <div className="max-w-xs flex flex-col gap-3 text-left">
          <h2 className="font-semibold text-base text-gray-900">
            Fale conosco
          </h2>

          <address className="flex flex-col gap-1 not-italic text-gray-700">
            {address && (
              <span className="whitespace-pre-line leading-relaxed">
                {address}
              </span>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className="text-orange-800 font-bold hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-800 mt-1"
                aria-label="Enviar e-mail para o Projeto Casulo"
              >
                {email}
              </a>
            )}

            {phone && (
              <a
                href={phoneDigits ? `tel:+55${phoneDigits}` : undefined}
                className="hover:text-primary font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label="Ligar para o Projeto Casulo"
              >
                {phone}
              </a>
            )}
          </address>
        </div>
      </div>

      <div className="border-t border-gray-400">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-black text-center md:text-left font-medium">
            © {new Date().getFullYear()} Projeto Casulo — Centro Dia da Pessoa
            com Deficiência. Todos os direitos reservados.
          </p>

          {(whatsappUrl || instagramUrl || facebookUrl) && (
            <nav aria-label="Redes sociais">
              <ul className="flex items-center gap-5">
                {whatsappUrl && (
                  <li>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp do Projeto Casulo"
                      className="text-gray-700 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <FaWhatsapp size={20} aria-hidden="true" />
                    </a>
                  </li>
                )}

                {instagramUrl && (
                  <li>
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram do Projeto Casulo"
                      className="text-gray-700 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <FaInstagram size={20} aria-hidden="true" />
                    </a>
                  </li>
                )}

                {facebookUrl && (
                  <li>
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook do Projeto Casulo"
                      className="text-gray-700 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <FaFacebook size={20} aria-hidden="true" />
                    </a>
                  </li>
                )}

                <li>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube do Projeto Casulo"
                    className="text-gray-700 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <FaYoutube size={20} aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
