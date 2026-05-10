import { storage, STORAGE_KEYS } from '../storage/localStorage'
import type { Team, TeamMember, TeamRole } from '../../models/Team'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function getTeams(): Team[] {
  return storage.get<Team[]>(STORAGE_KEYS.TEAMS) || []
}

function saveTeams(teams: Team[]): void {
  storage.set(STORAGE_KEYS.TEAMS, teams)
}

export const teamService = {
  getAll(): Team[] {
    return getTeams()
  },

  getById(id: string): Team | null {
    const teams = getTeams()
    return teams.find((team) => team.id === id) || null
  },

  create(name: string, description: string = ''): Team {
    const teams = getTeams()
    const now = new Date()
    const newTeam: Team = {
      id: generateId(),
      name,
      description,
      createdAt: now,
      updatedAt: now,
      ownerId: 'current_user',
    }
    teams.push(newTeam)
    saveTeams(teams)
    return newTeam
  },

  update(id: string, updates: Partial<Pick<Team, 'name' | 'description'>>): Team | null {
    const teams = getTeams()
    const index = teams.findIndex((team) => team.id === id)
    if (index === -1) return null

    teams[index] = {
      ...teams[index],
      ...updates,
      updatedAt: new Date(),
    }
    saveTeams(teams)
    return teams[index]
  },

  delete(id: string): boolean {
    const teams = getTeams()
    const index = teams.findIndex((team) => team.id === id)
    if (index === -1) return false

    teams.splice(index, 1)
    saveTeams(teams)
    return true
  },

  getMembers(teamId: string): TeamMember[] {
    const members = storage.get<TeamMember[]>('aurora_docs_team_members') || []
    return members.filter((m) => m.teamId === teamId)
  },

  addMember(teamId: string, userName: string, userEmail: string, role: TeamRole = 'member'): TeamMember {
    const members = storage.get<TeamMember[]>('aurora_docs_team_members') || []
    const newMember: TeamMember = {
      id: generateId(),
      teamId,
      userId: generateId(),
      userName,
      userEmail,
      role,
    }
    members.push(newMember)
    storage.set('aurora_docs_team_members', members)
    return newMember
  },

  removeMember(teamId: string, memberId: string): boolean {
    const members = storage.get<TeamMember[]>('aurora_docs_team_members') || []
    const index = members.findIndex((m) => m.id === memberId && m.teamId === teamId)
    if (index === -1) return false
    members.splice(index, 1)
    storage.set('aurora_docs_team_members', members)
    return true
  },
}
