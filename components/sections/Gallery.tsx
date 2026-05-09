import Image from 'next/image';

type GalleryImage = {
  src: string;
  alt: string;
  wide?: boolean;
};

type Props = {
  images: GalleryImage[];
};

export default function Gallery({ images }: Props) {
  return (
    <section aria-labelledby="gallery-title" className="mt-16">
      <h2
        id="gallery-title"
        className="text-base font-bold uppercase tracking-widest text-orange-800 mb-6"
      >
        Galeria
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-[180px]">
        {images.map((img, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-xl ${
              img.wide ? 'col-span-2' : 'col-span-1'
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes={
                img.wide
                  ? '(max-width: 768px) 100vw, 66vw'
                  : '(max-width: 768px) 50vw, 33vw'
              }
            />
          </div>
        ))}
      </div>
    </section>
  );
}
