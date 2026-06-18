export type UserRole = "gestor" | "cliente" | "designer" | "aprovador"

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
  // Contact & business info
  responsibleName?: string
  cityState?: string
  reportDay?: string
  contractValue?: string
  whatsapp?: string
  email?: string
  // Brand identity
  brandColors?: string[]
  fixedHashtags?: string
  // Rules
  contentRestrictions?: string
  approvalFlow?: string
  // Planning
  postsPerWeek?: number
}

export interface SocialNetwork {
  platform: "instagram" | "tiktok" | "linkedin" | "facebook" | "twitter" | "youtube"
  handle: string
  url?: string
}

export type PostStatus = "ideia" | "rascunho" | "aprovacao" | "agendado" | "publicado" | "reprovado"

export type PostNetwork = "instagram" | "tiktok" | "linkedin" | "facebook" | "twitter" | "youtube"

export type PostFormat = "reels" | "carrossel" | "foto" | "stories"

export interface PostAttachment {
  id: string
  type: "image" | "link" | "note"
  content: string
  name?: string
}

export interface Post {
  id: string
  clientId: string
  title: string
  caption: string
  network: PostNetwork
  format?: PostFormat
  status: PostStatus
  scheduledAt: string
  publishedAt?: string
  imageUrl?: string
  hashtags: string[]
  comments: PostComment[]
  attachments?: PostAttachment[]
  designerDone?: boolean
  designerDoneAt?: string
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

export interface Task {
  id: string
  clientId: string | null
  text: string
  done: boolean
  date: string      // "YYYY-MM-DD"
  createdAt: string
}

export interface ClientMetric {
  id: string
  clientId: string
  month: number      // 1–12
  year: number
  reach: number
  engagementRate: number   // e.g. 3.5 = 3.5%
  followerGrowth: number   // e.g. 2.1 = 2.1%
  postsPlanned: number
  postsPublished: number
  createdAt: string
}
