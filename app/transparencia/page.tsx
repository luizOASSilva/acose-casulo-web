import Filter from "@/components/ui/Filter";
import Hero from "@/components/Sections/Hero";
import Button from "@/components/ui/Button";

export default function Transparencia() {
  return (
    <main>
      <Hero
        title={
          <>
            Nossa <span className="text-primary">transparência</span> é pública
          </>
        }
        description="O Centro Dia da Pessoa com Deficiência tem como compromisso junto à sociedade e órgãos governamentais demonstrar os recursos recebidos e investidos na entidade."
        overlay={false}
      ></Hero>
      <section className="flex flex-col items-center">
        <Filter years={[2024, 2025, 2026]} />

        <div className="flex flex-row items-center justify-between max-w-7xl mx-auto w-full bg-white p-8 ">
          <div className="space-y-1.5">
            <h3 className="text-xl font-medium">
              Tem alguma dúvida sobre nossos documentos?
            </h3>
            <p className="text-gray-800 font-light">
              Entre em contato - respondemos o mais rápido possível
            </p>
          </div>
          <div>
            <Button
              href="/contato"
              text="Falar com a nossa equipe!"
              icon={false}
              ariaLabel=""
            />
          </div>
        </div>
      </section>
    </main>
  );
}
