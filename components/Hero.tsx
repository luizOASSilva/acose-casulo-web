import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Hero() {
    return (
        <header
            aria-labelledby="hero-title"
            className="relative min-h-[65vh] flex items-center overflow-hidden"
        >
            <Image 
                src="/hero.jpg" 
                alt=""
                aria-hidden="true"
                fill
                priority
                className="object-cover blur-[0.5px]"
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-black/40 via-black/15 to-transparent" />

            <div className="relative z-10 w-full max-w-130 px-6 py-20 space-y-5">

                <p className="text-xl text-primary font-bold">
                    CENTRO DIA DA PESSOA COM DEFICIÊNCIA
                </p>

                <h1
                    id="hero-title"
                    className="text-[50px] md:text-[60px] font-display font-bold text-white leading-tight"
                >
                    {"\"E quando"}<br />
                    {"forem adultos\""}
                </h1>

                <p className="text-white font-medium">
                    O Centro Dia nasceu para responder essa pergunta — oferecendo acolhimento, autonomia e dignidade para jovens adultos com deficiência que o mundo insistia em esquecer.
                </p>

                <Link
                    href="/centro-dia"
                    aria-label="Conheça a história do Centro Dia da Pessoa com Deficiência"
                    className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-md hover:opacity-90 transition font-medium w-fit"
                >
                    Conheça nossa história
                    <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
                </Link>

            </div>
        </header>
    )
}
