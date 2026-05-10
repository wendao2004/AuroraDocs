export interface Team {
  id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
  ownerId: string
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  userName: string
  userEmail: string
  role: TeamRole
}

export type TeamRole = 'owner' | 'admin' | 'member'

export const TeamRoleLabels: Record<TeamRole, string> = {
  owner: '所有者',
  admin: '管理员',
  member: '成员',
}

export const TeamRoleColors: Record<TeamRole, string> = {
  owner: '#f5222d',
  admin: '#faad14',
  member: '#1890ff',
}
