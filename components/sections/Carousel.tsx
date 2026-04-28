'use client'

import Card from "@/components/ui/Card"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/cn"
import { useCallback, useEffect, useState } from "react"

const slides = [
    {
        title: "Atividade ao ar livre",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
        alt: "Pessoas praticando atividade ao ar livre em um parque",
        summary: "Praticar atividades ao ar livre promove saúde física e mental, estimulando o contato com a natureza e fortalecendo vínculos sociais entre os participantes do Centro Dia.",
    },
    {
        title: "Oficina de pintura",
        image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
        alt: "Pessoa pintando em tela com tintas coloridas",
        summary: "A pintura em telas desenvolve a criatividade, a coordenação motora e a expressão emocional dos assistidos, sendo uma das atividades mais aguardadas da semana no Centro Dia.",
    },
    {
        title: "Horta comunitária",
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
        alt: "Mãos cuidando de plantas em uma horta",
        summary: "A horta comunitária ensina sobre sustentabilidade, alimentação saudável e responsabilidade coletiva, além de proporcionar momentos de relaxamento e conexão com a terra.",
    },
    {
        title: "Convivência em grupo",
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
        alt: "Grupo de pessoas interagindo e sorrindo",
        summary: "As atividades em grupo fortalecem laços de amizade, desenvolvem habilidades sociais e promovem um ambiente de respeito, inclusão e pertencimento para todos os participantes.",
    },
    {
        title: "Atividades físicas",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
        alt: "Pessoa praticando exercício físico",
        summary: "A prática regular de exercícios físicos melhora a qualidade de vida, previne doenças e contribui para o desenvolvimento da autonomia e da autoestima dos assistidos.",
    },
    {
        title: "Música e expressão",
        image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
        alt: "Pessoa tocando instrumento musical",
        summary: "A música estimula o desenvolvimento cognitivo, emocional e social, permitindo que os assistidos se expressem, criem e se conectem com os outros de forma única e especial.",
    },
    {
        title: "Culinária assistida",
        image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
        alt: "Pessoa preparando alimento na cozinha",
        summary: "As aulas de culinária desenvolvem autonomia, planejamento e habilidades práticas do dia a dia, além de promover uma alimentação mais saudável e consciente entre os participantes.",
    },
    {
        title: "Artesanato",
        image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80",
        alt: "Pessoa trabalhando com artesanato manual",
        summary: "O artesanato desenvolve a coordenação motora fina, a paciência e a criatividade, além de gerar produtos únicos que podem ser expostos e valorizados pela comunidade.",
    },
    {
        title: "Leitura guiada",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
        alt: "Pessoa lendo um livro em ambiente tranquilo",
        summary: "A leitura guiada estimula a imaginação, amplia o vocabulário e desenvolve a capacidade de interpretação, promovendo momentos de reflexão e aprendizado coletivo.",
    },
]

export default function Carousel() {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: "start",
        slidesToScroll: 1,
        breakpoints: {
            "(min-width: 768px)": { slidesToScroll: 3 }
        }
    })

    const [selectedIndex, setSelectedIndex] = useState<number>(0)
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [emblaApi])

    const onInit = useCallback(() => {
        if (!emblaApi) return
        setScrollSnaps(emblaApi.scrollSnapList())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return

        emblaApi.on("select", onSelect)
        emblaApi.on("reInit", onInit)
        emblaApi.on("reInit", onSelect)

        // eslint-disable-next-line react-hooks/set-state-in-effect
        onInit()
        onSelect()

        return () => {
            emblaApi.off("select", onSelect)
            emblaApi.off("reInit", onInit)
            emblaApi.off("reInit", onSelect)
        }
    }, [emblaApi, onSelect, onInit])

    const scrollTo = useCallback(
        (index: number) => emblaApi && emblaApi.scrollTo(index),
        [emblaApi]
    )

    return (
        <section aria-label="Carrossel de projetos" className="py-8">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex touch-pan-y touch-pinch-zoom gap-4">
                    {slides.map((slide, index) => (
                        <div key={index} className="flex-none w-full md:w-[calc(33.333%-11px)]">
                            <Card
                                image={slide.image}
                                title={slide.title}
                                alt={slide.alt}
                                summary={slide.summary}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-row justify-center items-center gap-2 mt-6">
                <button
                    onClick={() => emblaApi?.scrollPrev()}
                    aria-label="Slide anterior"
                    className="rounded-full p-2 bg-gray-300 cursor-pointer hover:bg-gray-400 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                    <ChevronLeft size={25} aria-hidden="true" />
                </button>

                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        aria-label={`Ir para grupo ${index + 1}`}
                        className={cn(
                            "rounded-full w-3 h-3 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                            index === selectedIndex ? "bg-primary" : "bg-gray-300"
                        )}
                    />
                ))}

                <button
                    onClick={() => emblaApi?.scrollNext()}
                    aria-label="Próximo slide"
                    className="rounded-full p-2 bg-primary/40 cursor-pointer hover:bg-primary/60 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                    <ChevronRight size={25} className="text-primary" aria-hidden="true" />
                </button>
            </div>
        </section>
    )
}