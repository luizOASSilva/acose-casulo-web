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

function normalizeExternalUrl(value?: string | null): string | null {
  const url = value?.trim();

  if (!url) return null;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `https://${url}`;
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

  const instagramUrl = normalizeExternalUrl(settings.instagram_url);
  const facebookUrl = normalizeExternalUrl(settings.facebook_url);
  const youtubeUrl = normalizeExternalUrl(settings.youtube_url);

  const hasSocialLinks = Boolean(
    whatsappUrl || instagramUrl || facebookUrl || youtubeUrl
  );

  return (
    <footer className="bg-footer text-sm" aria-label="Rodapé do site">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-3 md:items-start md:justify-items-center lg:px-6">
        <div className="flex max-w-xs flex-col gap-3 text-left">
          <h2 className="text-base font-semibold text-gray-900">
            Projeto Casulo — Centro Dia da Pessoa com Deficiência
          </h2>

          <p className="text-gray-700">ONG • Bragança Paulista/SP</p>

          <p className="leading-relaxed text-gray-700">
            Promovendo autonomia, inclusão e dignidade para jovens adultos com
            deficiência desde 2000.
          </p>
        </div>

        <div className="flex max-w-xs flex-col gap-3 text-left">
          <h2 className="text-base font-semibold text-gray-900">
            Horário de atendimento
          </h2>

          <p className="whitespace-pre-line text-gray-700">{businessHours}</p>
        </div>

        <div className="flex max-w-xs flex-col gap-3 text-left">
          <h2 className="text-base font-semibold text-gray-900">
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
                className="mt-1 font-bold text-orange-800 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-800"
                aria-label="Enviar e-mail para o Projeto Casulo"
              >
                {email}
              </a>
            )}

            {phone && (
              <a
                href={phoneDigits ? `tel:+55${phoneDigits}` : undefined}
                className="font-medium transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label="Ligar para o Projeto Casulo"
              >
                {phone}
              </a>
            )}
          </address>
        </div>
      </div>

      <div className="border-t border-gray-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row lg:px-6">
          <p className="text-center text-xs font-medium text-black md:text-left">
            © {new Date().getFullYear()} Projeto Casulo — Centro Dia da Pessoa
            com Deficiência. Todos os direitos reservados.
          </p>

          {hasSocialLinks && (
            <nav aria-label="Redes sociais">
              <ul className="flex items-center gap-5">
                {whatsappUrl && (
                  <li>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp do Projeto Casulo"
                      className="text-gray-700 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
                      className="text-gray-700 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
                      className="text-gray-700 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <FaFacebook size={20} aria-hidden="true" />
                    </a>
                  </li>
                )}

                {youtubeUrl && (
                  <li>
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube do Projeto Casulo"
                      className="text-gray-700 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <FaYoutube size={20} aria-hidden="true" />
                    </a>
                  </li>
                )}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
