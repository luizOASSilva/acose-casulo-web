import { getActivities } from '@/services/activities';
import ActivityListContainer from '@/components/containers/ActivityListContainer';

export default async function AdminAtividadesPage() {
  const activities = await getActivities();

  return <ActivityListContainer activities={activities} isAdmin={true} />;
}
