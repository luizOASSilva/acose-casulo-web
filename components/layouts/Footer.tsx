import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';

export default function Footer() {
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
          <h2 className="font-semibold text-base text-gray-900">Horário de atendimento</h2>

          <p className="font-medium text-gray-800">Segunda a sexta-feira</p>

          <p className="text-gray-700">
            <time dateTime="08:00">08h</time> às{' '}
            <time dateTime="17:00">17h</time>
          </p>
        </div>

        <div className="max-w-xs flex flex-col gap-3 text-left">
          <h2 className="font-semibold text-base text-gray-900">Fale conosco</h2>

          <address className="flex flex-col gap-1 not-italic text-gray-700">
            <span>Rua Francisco Rodrigues Dias, 80</span>
            <span>Uberaba — Bragança Paulista/SP</span>
            <span>CEP: 12908-843</span>

            <a
              href="mailto:contato@projetocasulobp.org.br"
              className="text-orange-800 font-bold hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-800 mt-1"              aria-label="Enviar e-mail para o Projeto Casulo"
            >
              contato@projetocasulobp.org.br
            </a>

            <a
              href="tel:+551124734994"
              className="hover:text-primary font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Ligar para o Projeto Casulo"
            >
              (11) 2473-4994
            </a>
          </address>
        </div>
      </div>

      <div className="border-t border-gray-400">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-900 text-center md:text-left font-medium">
            © {new Date().getFullYear()} Projeto Casulo — Centro Dia da Pessoa
            com Deficiência. Todos os direitos reservados.
          </p>

          <nav aria-label="Redes sociais">
            <ul className="flex items-center gap-5">
              <li>
                <a
                  href="https://wa.me/551124734994?text=Olá%20vim%20pelo%20site"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp do Projeto Casulo"
                  className="text-gray-700 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <FaWhatsapp size={20} aria-hidden="true" />
                </a>
              </li>

              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram do Projeto Casulo"
                  className="text-gray-700 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <FaInstagram size={20} aria-hidden="true" />
                </a>
              </li>

              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook do Projeto Casulo"
                  className="text-gray-700 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <FaFacebook size={20} aria-hidden="true" />
                </a>
              </li>

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
        </div>
      </div>
    </footer>
  );
}
