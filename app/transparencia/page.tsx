import Hero from "@/components/Hero";

export default function Transparencia() {
    return (
        <Hero 
            title={
                <>
                    Nossa{" "}
                    <span className="text-primary">transparência</span>{" "}
                    é pública
                </>
            }
            description="O Centro Dia da Pessoa com Deficiência tem como compromisso junto à sociedade e órgãos governamentais demonstrar os recursos recebidos e investidos na entidade."
            overlay={false}
        ></Hero>
    )
}