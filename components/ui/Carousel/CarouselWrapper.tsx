import { getRecentActivities } from "@/services/activities";
import CarouselClient from "./CarouselClient";

export default async function Carousel() {
  const activities = await getRecentActivities();
  console.log('activities:', activities);
  return <CarouselClient activities={activities ?? []} />;
}
