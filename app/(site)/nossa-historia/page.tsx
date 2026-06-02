import Gallery from '@/components/sections/Gallery';
import { OG_IMAGE } from '@/lib/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Centro Dia',
  description:
    'Conheça a história do Centro Dia da Pessoa com Deficiência, idealizado pelo Projeto Casulo para promover autonomia e dignidade em Bragança Paulista.',
  alternates: {
    canonical: '/nossa-historia',
  },
  openGraph: {
    title: 'Centro Dia | Acose Casulo — Bragança Paulista',
    description:
      'A história do Centro Dia da Pessoa com Deficiência e seu compromisso com a inclusão e dignidade de jovens adultos.',
    url: '/nossa-historia',
    type: 'article',
    publishedTime: '2022-01-01T00:00:00Z',
    authors: ['Padre José Roberto Cavasa'],
    images: OG_IMAGE,
  },
};

const gallery = [
  {
    src: '/nossa-historia/nossa-historia1.jpeg',
    alt: 'Representantes e apoiadores do Projeto Casulo em encontro institucional',
  },
  {
    src: '/nossa-historia/nossa-historia2.avif',
    alt: 'Grupo reunido em espaço interno da Acose Casulo durante atividade comunitária',
  },
  {
    src: '/nossa-historia/nossa-historia3.avif',
    alt: 'Equipe e comunidade em momento de confraternização no Centro Dia',
  },
  {
    src: '/nossa-historia/nossa-historia4.avif',
    alt: 'Participante recebendo camiseta do Projeto Casulo em atividade institucional',
  },
  {
    src: '/nossa-historia/nossa-historia6.jpg',
    alt: 'Participantes e apoiadores acompanhando atividade institucional da Acose Casulo',
    wide: true,
  },
  {
    src: '/nossa-historia/nossa-historia7.jpg',
    alt: 'Assinatura e registro de parceria com representantes da comunidade',
    wide: true,
  },
  {
    src: '/nossa-historia/nossa-historia5.jpeg',
    alt: 'Representante da Acose Casulo com mascotes em evento comunitário',
  },
];

export default function NossaHistoria() {
  return (
    <main className="w-[90%] max-w-3xl mx-auto px-6 py-20">
      <article aria-labelledby="article-title">
        <header className="space-y-6 mb-10">
          <h1
            id="article-title"
            className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight"
          >
            Conheça a História do Centro Dia
          </h1>
        </header>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-lg leading-relaxed">
          <p>
            Há alguns anos, quando o tema &quot;Inclusão&quot; passou a ser
            evidenciado, começamos a perceber que até atualmente tudo se referia
            à deficiência, voltado em grande parte, às crianças e jovenzinhos,
            sem o olhar para o futuro.
          </p>

          <p>
            E quando forem adultos? Enquanto crianças e jovens, eles usufruem
            das Instituições, que atendem até o limite definido por elas ou,
            quando atingem uma certa idade, eles são desligados dessas
            Instituições. Ficam vulneráveis e à mercê da maldade humana.
          </p>

          <p>
            Como dar atenção, continuidade e assistência a esses adultos? O
            Projeto Casulo, idealizado por Rita Leme em parceria com o Padre
            José Roberto Cavasa abraçou essa causa. Atualmente o Padre José
            Roberto Cavasa é o responsável por presidir a organização, hoje com
            o nome de Centro Dia da Pessoa com Deficiência.
          </p>

          <p>
            A Instituição tem como objetivo ser um &quot;Centro de Convivência
            de Jovens Adultos com deficiência&quot; neurológica, seu trabalho é
            proporcionar a socialização, incentivar a autoestima e desenvolver a
            autonomia, levando-os a uma qualidade de vida e terem sua dignidade
            respeitada; busca uma interação entre a Instituição, o deficiente e
            a família.
          </p>

          <p>
            A Associação Comunitária Santo Expedito, criada em 2000 é a
            mantenedora do Centro Dia da Pessoa com Deficiência, que atualmente
            atende jovens adultos com deficiência e trabalha com afinco para
            concretizar mais projetos sociais, dentro do próprio projeto, e
            torná-lo pioneiro na luta por essa causa.
          </p>
        </div>

        <blockquote className="border-l-4 border-l-primary pl-4 mt-10 text-gray-600">
          <p>Bragança Paulista, 2022</p>

          <cite className="block mt-2 not-italic">
            Padre José Roberto Cavasa
          </cite>
        </blockquote>

        <Gallery images={gallery} />
      </article>
    </main>
  );
}
