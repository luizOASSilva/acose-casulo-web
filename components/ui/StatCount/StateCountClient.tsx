'use client';

import { useRef } from 'react';
import { useInView } from '@/hooks/useInView';
import StatCounter from '@/components/ui/statCount/StatCounter';

type Props = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
  color?: string;
};

export default function StatCounterClient(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const start = useInView(ref, 0.5);

  return (
    <div ref={ref}>
      <StatCounter {...props} start={start} />
    </div>
  );
}
