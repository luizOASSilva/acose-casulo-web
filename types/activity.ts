export interface Activity {
  id: number
  slug: string
  likes: number
  title: string
  content: string
  media: {
    url: string
    alt_text: string
    caption?: string | null
  }
  created_at: string
}
