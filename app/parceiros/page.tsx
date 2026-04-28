import PartnerMarquee from "@/components/PartnerMarquee"
import Button from "@/components/Button"

export default function Parceiros() {
    return (
        <main>
            <section aria-labelledby="partners-heading" className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 flex items-end justify-between gap-8">
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

                    <div className="text-right shrink-0">
                        <p className="text-6xl font-extrabold text-stone-400 leading-none">
                            13
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Parceiros ativos
                        </p>
                    </div>
                </div>
            </section>

            <PartnerMarquee />

            <section aria-label="Seja um parceiro" className="border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-gray-700 font-medium text-lg max-w-xl">
                        Quer apoiar o Centro Dia e fazer parte desta rede de parceiros?
                    </p>
                    <Button
                        href="/contato"
                        text="Seja um parceiro"
                        variant="primary"
                    />
                </div>
            </section>
        </main>
    )
}