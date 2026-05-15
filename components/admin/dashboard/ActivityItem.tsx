import { Clock3 } from "lucide-react";

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
};

export default function ActivityItem({
  title,
  description,
  time,
}: ActivityItemProps) {
  return (
    <div className="flex items-start justify-between rounded-md border border-zinc-100 bg-white/50 p-4">
      <div>
        <h3 className="font-medium text-zinc-900">
          {title}
        </h3>

        <p className="mt-1 text-sm text-zinc-600">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Clock3 size={14} />
        {time}
      </div>
    </div>
  );
}
