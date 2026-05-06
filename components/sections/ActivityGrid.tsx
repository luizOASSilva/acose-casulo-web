import Link from 'next/link';
import { getActivities } from '@/services/activities';
import ActivityCard from '@/components/ui/ActivityCard';

export default async function ActivityGrid() {
  const activities = await getActivities();

  return (
    <section aria-labelledby="activities-title">
      <h2 id="activities-title" className="sr-only">
        Lista de atividades
      </h2>

      {activities.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
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
      ) : (
        <p className="text-gray-400 italic">Nenhuma atividade encontrada.</p>
      )}
    </section>
  );
}
