import { getRecentActivities } from "@/services/activities";
import CarouselClient from "./CarouselClient";

export default async function Carousel() {
  const activities = await getRecentActivities();
  return <CarouselClient activities={activities ?? []} />;
}
