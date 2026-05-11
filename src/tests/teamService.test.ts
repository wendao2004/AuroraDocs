import { describe, it, expect, beforeEach, vi } from 'vitest'
import { teamService } from '../services/storage/teamService'
import type { Team, TeamRole } from '../models/Team'

const mockLocalStorage = {
  data: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.data[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.data[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.data[key]
  }),
  clear: vi.fn(() => {
    mockLocalStorage.data = {}
  }),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

const TEAMS_STORAGE_KEY = 'aurora_docs_teams'
const MEMBERS_STORAGE_KEY = 'aurora_docs_team_members'

describe('teamService', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('CRUD Operations', () => {
    it('should create a new team', () => {
      const team = teamService.create('Test Team', 'Test Description')

      expect(team).toBeDefined()
      expect(team.id).toBeDefined()
      expect(team.name).toBe('Test Team')
      expect(team.description).toBe('Test Description')
      expect(team.ownerId).toBe('current_user')
      expect(team.createdAt).toBeInstanceOf(Date)
      expect(team.updatedAt).toBeInstanceOf(Date)
    })

    it('should create team with default description', () => {
      const team = teamService.create('Team Without Description')
      expect(team.description).toBe('')
    })

    it('should get all teams', () => {
      teamService.create('Team 1')
      teamService.create('Team 2')
      teamService.create('Team 3')

      const teams = teamService.getAll()
      expect(teams).toHaveLength(3)
    })

    it('should get team by id', () => {
      const created = teamService.create('Test Team')
      const retrieved = teamService.getById(created.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('Test Team')
    })

    it('should return null for non-existent team', () => {
      const result = teamService.getById('non-existent-id')
      expect(result).toBeNull()
    })

    it('should update a team', () => {
      const team = teamService.create('Original Name')
      const updated = teamService.update(team.id, {
        name: 'Updated Name',
        description: 'Updated Description'
      })

      expect(updated).toBeDefined()
      expect(updated?.name).toBe('Updated Name')
    })

    it('should delete a team', () => {
      const team = teamService.create('To Delete')
      const result = teamService.delete(team.id)

      expect(result).toBe(true)
      expect(teamService.getById(team.id)).toBeNull()
    })

    it('should return false when deleting non-existent team', () => {
      const result = teamService.delete('non-existent-id')
      expect(result).toBe(false)
    })
  })

  describe('Member Management', () => {
    it('should add member to team', () => {
      const team = teamService.create('Test Team')
      const member = teamService.addMember(team.id, 'John Doe', 'john@example.com', 'admin')

      expect(member).toBeDefined()
      expect(member.teamId).toBe(team.id)
      expect(member.userName).toBe('John Doe')
      expect(member.userEmail).toBe('john@example.com')
      expect(member.role).toBe('admin')
    })

    it('should add member with default role', () => {
      const team = teamService.create('Test Team')
      const member = teamService.addMember(team.id, 'Jane Doe', 'jane@example.com')

      expect(member.role).toBe('member')
    })

    it('should get members for team', () => {
      const team1 = teamService.create('Team 1')
      const team2 = teamService.create('Team 2')

      teamService.addMember(team1.id, 'Member 1', 'm1@example.com')
      teamService.addMember(team1.id, 'Member 2', 'm2@example.com')
      teamService.addMember(team2.id, 'Member 3', 'm3@example.com')

      const members1 = teamService.getMembers(team1.id)
      const members2 = teamService.getMembers(team2.id)

      expect(members1).toHaveLength(2)
      expect(members2).toHaveLength(1)
    })

    it('should remove member from team', () => {
      const team = teamService.create('Test Team')
      const member = teamService.addMember(team.id, 'John Doe', 'john@example.com')

      const result = teamService.removeMember(team.id, member.id)

      expect(result).toBe(true)
      expect(teamService.getMembers(team.id)).toHaveLength(0)
    })

    it('should return false when removing non-existent member', () => {
      const team = teamService.create('Test Team')
      const result = teamService.removeMember(team.id, 'non-existent-id')

      expect(result).toBe(false)
    })

    it('should get all members', () => {
      const team1 = teamService.create('Team 1')
      const team2 = teamService.create('Team 2')

      teamService.addMember(team1.id, 'Member 1', 'm1@example.com')
      teamService.addMember(team2.id, 'Member 2', 'm2@example.com')

      const allMembers = teamService.getAllMembers()
      expect(allMembers).toHaveLength(2)
    })

    it('should get member by id', () => {
      const team = teamService.create('Test Team')
      const member = teamService.addMember(team.id, 'John Doe', 'john@example.com')

      const retrieved = teamService.getMemberById(member.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.userName).toBe('John Doe')
    })

    it('should return null for non-existent member', () => {
      const result = teamService.getMemberById('non-existent-id')
      expect(result).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty name', () => {
      const team = teamService.create('')
      expect(team.name).toBe('')
    })

    it('should handle empty description', () => {
      const team = teamService.create('Team', '')
      expect(team.description).toBe('')
    })

    it('should handle unicode characters', () => {
      const team = teamService.create('团队测试 🎉', '描述内容')
      expect(team.name).toBe('团队测试 🎉')
      expect(team.description).toBe('描述内容')
    })

    it('should handle special characters', () => {
      const team = teamService.create('Team <script>alert("xss")</script>', 'Description')
      expect(team.name).toBe('Team <script>alert("xss")</script>')
    })

    it('should handle different roles', () => {
      const roles: TeamRole[] = ['member', 'admin', 'owner']
      const team = teamService.create('Test Team')

      roles.forEach(role => {
        const member = teamService.addMember(team.id, `User ${role}`, `${role}@example.com`, role)
        expect(member.role).toBe(role)
      })
    })

    it('should handle many teams', () => {
      for (let i = 0; i < 20; i++) {
        teamService.create(`Team ${i}`)
      }
      const teams = teamService.getAll()
      expect(teams).toHaveLength(20)
    })

    it('should handle many members per team', () => {
      const team = teamService.create('Large Team')
      for (let i = 0; i < 30; i++) {
        teamService.addMember(team.id, `Member ${i}`, `m${i}@example.com`)
      }
      const members = teamService.getMembers(team.id)
      expect(members).toHaveLength(30)
    })
  })

  describe('Data Persistence', () => {
    it('should persist teams to localStorage', () => {
      teamService.create('Persisted Team')

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        TEAMS_STORAGE_KEY,
        expect.any(String)
      )
    })

    it('should persist members to localStorage', () => {
      const team = teamService.create('Test Team')
      teamService.addMember(team.id, 'John Doe', 'john@example.com')

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        MEMBERS_STORAGE_KEY,
        expect.any(String)
      )
    })
  })
})