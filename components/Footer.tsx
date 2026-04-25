import Link from "next/link"
import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa"

export default function Footer() {
    return (
        <footer className="bg-footer text-sm" aria-label="Rodapé do site">
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 grid grid-cols-1 md:grid-cols-3 md:items-start md:justify-items-center gap-10">

                <div className="max-w-xs space-y-3 text-left">
                    <h2 className="font-display font-semibold text-base">
                        Centro Dia da Pessoa com Deficiência
                    </h2>

                    <p className="text-gray-600">Projeto Casulo</p>

                    <p className="text-gray-600 leading-relaxed">
                        Promovendo autonomia, inclusão e dignidade para jovens adultos com deficiência desde 2000.
                    </p>
                </div>

                <div className="max-w-xs space-y-3 text-left">
                    <h2 className="font-display font-semibold text-base">
                        Horário de atendimento
                    </h2>

                    <p className="font-medium text-gray-700">
                        Segunda-feira à sexta-feira
                    </p>

                    <p className="text-gray-600">
                        <time dateTime="08:00">08h</time> às{" "}
                        <time dateTime="17:00">17h</time>
                    </p>
                </div>

                <div className="max-w-xs space-y-3 text-left">
                    <h2 className="font-display font-semibold text-base">
                        Fale conosco
                    </h2>

                    <address className="flex flex-col gap-1 not-italic text-gray-600">
                        <span>Rua Francisco Rodrigues Dias, 80</span>
                        <span>Uberaba • Bragança Paulista/SP</span>
                        <span>CEP: 12908-843</span>

                        <a
                            href="mailto:contato@projetocasulobp.org.br"
                            aria-label="Enviar e-mail para o Projeto Casulo"
                            className="hover:text-primary transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary text-primary mt-1"
                        >
                            contato@projetocasulobp.org.br
                        </a>

                        <a
                            href="tel:+551124734994"
                            aria-label="Ligar para o Projeto Casulo"
                            className="hover:text-primary transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            Tel: (11) 2473-4994
                        </a>
                    </address>
                </div>

            </div>

            <div className="border-t border-gray-300">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-500">
                        © 2024 Centro Dia da Pessoa com Deficiência · Todos os direitos reservados
                    </p>

                    <nav aria-label="Redes sociais">
                        <ul className="flex items-center gap-5">
                            <li>
                                <Link
                                    href="https://wa.me/551124734994"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="WhatsApp do Projeto Casulo"
                                    className="text-gray-500 hover:text-primary transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                >
                                    <FaWhatsapp size={20} aria-hidden="true" />
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram do Projeto Casulo"
                                    className="text-gray-500 hover:text-primary transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                >
                                    <FaInstagram size={20} aria-hidden="true" />
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook do Projeto Casulo"
                                    className="text-gray-500 hover:text-primary transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                >
                                    <FaFacebook size={20} aria-hidden="true" />
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://youtube.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="YouTube do Projeto Casulo"
                                    className="text-gray-500 hover:text-primary transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                >
                                    <FaYoutube size={20} aria-hidden="true" />
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </footer>
    )
}