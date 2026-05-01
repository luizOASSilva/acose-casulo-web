import { useNumberAnimation } from "@/hooks/useNumberAnimation";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  duration?: number;
  start: boolean;
};

export default function StatCounter({
  value,
  prefix = "",
  suffix = "",
  label,
  duration,
  start,
}: Props) {
  const animatedValue = useNumberAnimation({
    to: value,
    duration,
    start,
  });

  return (
    <div className="flex flex-col items-center gap-3" role="group" aria-label={`${label}: ${prefix}${value}${suffix}`}>
      <p
        className="text-6xl md:text-7xl font-extrabold tabular-nums leading-none"
        aria-hidden="true"
      >
        {prefix}{animatedValue}{suffix}
      </p>

      <p className="text-sm md:text-base uppercase tracking-widest opacity-85 text-center" aria-hidden="true">
        {label}
      </p>
    </div>
  );
}
