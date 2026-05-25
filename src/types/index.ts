export type UserRole = "gestor" | "cliente"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface Client {
  id: string
  name: string
  slug: string
  niche: string
  logo?: string
  socialNetworks: SocialNetwork[]
  toneOfVoice: string
  briefing: string
  color: string
  createdAt: string
}

export interface SocialNetwork {
  platform: "instagram" | "tiktok" | "linkedin" | "facebook" | "twitter" | "youtube"
  handle: string
  url?: string
}

export type PostStatus = "ideia" | "rascunho" | "aprovacao" | "agendado" | "publicado" | "reprovado"

export type PostNetwork = "instagram" | "tiktok" | "linkedin" | "facebook" | "twitter" | "youtube"

export interface Post {
  id: string
  clientId: string
  title: string
  caption: string
  network: PostNetwork
  status: PostStatus
  scheduledAt: string
  publishedAt?: string
  imageUrl?: string
  hashtags: string[]
  comments: PostComment[]
  createdAt: string
  updatedAt: string
}

export interface PostComment {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorRole: UserRole
  content: string
  createdAt: string
}

export interface CalendarDay {
  date: Date
  posts: Post[]
}
