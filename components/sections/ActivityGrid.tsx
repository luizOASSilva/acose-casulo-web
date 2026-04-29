"use client";

import Link from "next/link";
import { activities } from "@/app/atividades/activity";
import ActivityCard from "@/components/ui/ActivityCard";
import type { Activity } from "@/types/activity";

export default function ActivityGrid() {
  return (
    <section aria-labelledby="activities-title">
      <h2 id="activities-title" className="sr-only">
        Lista de atividades
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activities.map((activity: Activity) => (
          <li key={activity.id}>
            <Link
              href={`/atividades/${activity.slug}`}
              className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={`Ver detalhes da atividade ${activity.title}`}
            >
              <ActivityCard activity={activity} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
