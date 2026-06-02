export interface AnalyticsPeriod {
  days: number;
  start_date: string;
  end_date: string;
}

export interface AnalyticsOverview {
  active_users: number;
  sessions: number;
  pageviews: number;
  event_count: number;
  conversions: number;
  engaged_sessions: number;
  engagement_rate: number;
  average_session_duration: number;
  active_users_growth: string;
  sessions_growth: string;
  pageviews_growth: string;
  conversion_rate: string;
}

export interface AnalyticsRealtime {
  active_users: number;
}

export interface AnalyticsTimeseriesItem {
  date: string | null;
  active_users: number;
  pageviews: number;
  sessions: number;
}

export interface AnalyticsTopPage {
  path: string;
  title: string;
  pageviews: number;
  active_users: number;
  average_session_duration: number;
}

export interface AnalyticsSource {
  source: string;
  sessions: number;
  active_users: number;
}

export interface AnalyticsDevice {
  device: string;
  active_users: number;
  sessions: number;
}

export interface AnalyticsCountry {
  country: string;
  active_users: number;
  sessions: number;
}

export interface AnalyticsCity {
  city: string;
  active_users: number;
  sessions: number;
}

export interface AdminAnalyticsSummary {
  available: boolean;
  period: AnalyticsPeriod;
  overview: AnalyticsOverview;
  realtime: AnalyticsRealtime;
  timeseries: AnalyticsTimeseriesItem[];
  top_pages: AnalyticsTopPage[];
  sources: AnalyticsSource[];
  devices: AnalyticsDevice[];
  countries: AnalyticsCountry[];
  cities: AnalyticsCity[];
}
