import { getRecentActivities } from '@/services/activities';
import CarouselClient from '@/components/ui/Carousel/CarouselClient';

export default async function Carousel() {
  const activities = await getRecentActivities();
  return <CarouselClient activities={activities ?? []} />;
}
