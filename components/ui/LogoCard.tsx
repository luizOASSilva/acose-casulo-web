import Image from "next/image";
import type { Partner } from "@/types/Partner";

export default function LogoCard({
  logo,
  index,
  isClone,
}: {
  logo: Partner;
  index: number;
  isClone?: boolean;
}) {
  const isPriority = !isClone && index < 3;

  return (
    <div
      role="listitem"
      className="
        mx-2 md:mx-6
        flex items-center justify-center
        w-30 h-17.5
        md:w-55 md:h-30
        rounded-2xl
        shadow-sm border border-gray-200
        transition-all duration-500 hover:scale-105
      "
      style={{ backgroundColor: logo.bgColor || "#ffffff" }}
    >
      <div className="relative w-[70%] h-[70%]">
        <Image
          src={logo.src}
          alt={isClone ? "" : `Parceiro ${logo.name}`}
          fill
          priority={isPriority}
          loading={isPriority ? "eager" : "lazy"}
          className="object-contain"
          aria-hidden={isClone ? true : undefined}
        />
      </div>
    </div>
  );
}
