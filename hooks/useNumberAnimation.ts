import { useEffect, useState } from "react";

type UseNumberAnimationProps = {
  to: number;
  duration?: number;
  start: boolean;
};

export function useNumberAnimation({
  to,
  duration = 2000,
  start,
}: UseNumberAnimationProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(2, -8 * progress);

      const current = Math.floor(eased * to);

      if (progress === 1) {
        setValue(to);
      } else {
        setValue(current);
        requestAnimationFrame(animate);
      }
    };

    const raf = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(raf);
  }, [to, duration, start]);

  return value;
}
