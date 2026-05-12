import { notFound } from 'next/navigation';
import Image from 'next/image';
import LoginForm from '@/components/forms/LoginForm';

const SECRET_TOKEN = process.env.NEXT_PUBLIC_PANEL_SLUG ?? '';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function AcessoPage({ params }: Props) {
  const { token } = await params;

  if (!SECRET_TOKEN || token !== SECRET_TOKEN) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <section
        className="grid min-h-screen lg:grid-cols-2"
        aria-label="Área de acesso da plataforma"
      >
        <aside className="relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center">
          <div className="absolute inset-0 bg-primary" />

          <svg
            className="absolute inset-0 h-full w-full opacity-[0.06]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                x="0"
                y="0"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="24" cy="24" r="18" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-white">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-10 py-8 backdrop-blur-sm">
              <Image
                src="/logo.svg"
                alt="Logo ACOSE Casulo"
                width={200}
                height={56}
                className="invert brightness-0"
              />
              <div className="h-px w-24 bg-white/20" />
              <span className="text-xs font-medium tracking-[0.2em] text-white/60 uppercase">
                Plataforma Institucional
              </span>
            </div>

            <p className="max-w-55 text-center text-sm leading-relaxed text-white/50">
              Gestão e transparência para a organização
            </p>
          </div>
        </aside>

        <div className="relative flex items-center justify-center overflow-hidden bg-gray-50 px-6 py-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#d46c2b12,transparent_60%)]" />

          <div className="relative z-10 w-full max-w-sm">
            <header className="mb-8 space-y-2">
              <span className="inline-flex rounded-md border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                Área Restrita
              </span>

              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                Bem-vindo de volta
              </h1>

              <p className="text-sm leading-relaxed text-gray-500">
                Acesse o painel administrativo da organização.
              </p>
            </header>

            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
