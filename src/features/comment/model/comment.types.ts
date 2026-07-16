export interface Comment {
  id: number
  content: string
  authorName: string
  isGuest: boolean
  status: 'ACTIVE' | 'DELETED'
  children: Comment[]
  createdAt: string
}

export interface CreateCommentRequest {
  content: string
  parentId?: number
  guestName?: string
  guestPassword?: string
}
