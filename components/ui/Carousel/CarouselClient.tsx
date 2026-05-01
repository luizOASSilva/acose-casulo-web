"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import ActivityCard from "@/components/ui/ActivityCard";
import type { Activity } from "@/types/activity";

interface CarouselClientProps {
  activities?: Activity[];
}

export default function CarouselClient({ activities = [] }: CarouselClientProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 3, align: "start" },
    },
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const onInit = useCallback(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    onInit();
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onInit);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect, onInit]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  if (activities.length === 0) {
    return (
      <p className="text-gray-400 italic py-8">Nenhuma atividade encontrada.</p>
    );
  }

  return (
    <section aria-label="Carrossel de atividades" className="py-8 max-w-7xl md:mx-auto md:px-4">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y touch-pinch-zoom gap-4 pl-4 md:pl-0">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex-none w-[75vw] md:w-[calc(33.333%-11px)]"
            >
              <ActivityCard activity={activity} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-row justify-center items-center gap-2 mt-5">
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="rounded-full p-2 bg-gray-100 text-gray-600 shrink-0 hover:bg-gray-200 transition cursor-pointer"
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </button>

        <div className="flex items-center justify-center">
          {scrollSnaps.map((_, index) => (
            <div key={index} className="flex items-center justify-center w-4 h-5">
              <button
                onClick={() => scrollTo(index)}
                className={cn(
                  "rounded-full h-2.5 transition-all duration-300 ease-in-out",
                  index === selectedIndex ? "bg-primary w-6" : "bg-gray-300 w-2.5",
                )}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => emblaApi?.scrollNext()}
          className="rounded-full p-2 bg-primary/10 text-primary shrink-0 hover:bg-primary/20 transition cursor-pointer"
        >
          <ChevronRight size={24} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
