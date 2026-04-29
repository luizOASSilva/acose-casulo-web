import Image from "next/image";

interface CardProps {
  image: string;
  alt: string;
  title: string;
  summary: string;
}

export default function Card({ image, alt, title, summary }: CardProps) {
  return (
    <article className="group rounded-xl overflow-hidden border border-black/5 bg-white transition-all duration-300 hover:border-primary/25 hover:shadow-md">
      <div className="relative h-52 overflow-hidden">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div
          className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition"
          aria-hidden="true"
        />

        <h3 className="absolute bottom-3 left-4 text-white font-semibold text-sm z-10">
          {title}
        </h3>
      </div>

      <div className="p-5">
        <p
          className="text-sm text-gray-700 leading-relaxed overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            maxHeight: "4.5rem",
          }}
        >
          {summary}
        </p>
      </div>
    </article>
  );
}
