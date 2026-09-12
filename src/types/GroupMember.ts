export interface GroupMember {
  id: string
  groupId: string
  userId: string
  userName: string
  joinedAt: string
  role: 'member' | 'admin'
}

export interface JoinGroupData {
  groupCode: string
  userId: string
  userName: string
}

