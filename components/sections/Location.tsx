export default function Location() {
  return (
    <section aria-labelledby="location-title" className="py-20">
      <div className="w-4/5 mx-auto max-w-6xl">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          <div className="space-y-6">
            <header className="space-y-4">
              <h2
                id="location-title"
                className="text-2xl md:text-4xl font-bold leading-tight"
              >
                Onde nos encontrar
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed">
                A Rendar está localizada em Bragança Paulista, SP, em um espaço
                preparado para acolher, orientar e oferecer apoio às mulheres
                que buscam recomeçar suas histórias.
              </p>

              <div className="text-gray-600 leading-relaxed space-y-2">
                <p className="font-semibold text-black text-lg">Nosso Endereço:</p>
                <address className="not-italic">
                  Rua Alziro de Oliveira, 1591 – Santa Lúcia<br />
                  Bragança Paulista – SP, CEP 12926-030.
                </address>
              </div>

              <p className="text-gray-600 leading-relaxed">
                Aqui, você encontra um ambiente de cuidado, escuta e suporte,
                pensado para acompanhar cada mulher em suas necessidades e
                caminhos de reconstrução.
              </p>

              <div className="pt-4">
                <p className="text-gray-600 mb-2">Para mais informações ou agendamento:</p>
                <a
                  href="https://wa.me/5511996285770"
                  className="inline-flex items-center text-primary font-bold hover:underline underline-offset-4 text-xl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  (11) 99628-5770
                </a>
              </div>
            </header>
          </div>

          <div className="relative w-full h-125 rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            <iframe
              title="Mapa da ONG Rendar - Bragança Paulista"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3674.225219920512!2d-46.53965778857434!3d-22.922459538356943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cec91ce2a165e5%3A0xf4331fd02bd67422!2sONG%20Rendar!5e0!3m2!1spt-BR!2sbr!4v1715800000000!5m2!1spt-BR!2sbr"
              className="absolute inset-0 w-full h-full"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </div>
    </section>
  );
}