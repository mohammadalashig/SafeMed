import { getErrorStats } from '../error-tracking'

// Mock Supabase
jest.mock('../supabase', () => ({
  createClientComponentClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                then: jest.fn((callback) => callback({ data: [], error: null })),
              })),
            })),
          })),
        })),
      })),
    })),
  })),
}))

describe('Error Tracking', () => {
  describe('getErrorStats', () => {
    it('should return empty stats when no errors exist', async () => {
      const stats = await getErrorStats('test-user-id')
      
      expect(stats.total).toBe(0)
      expect(stats.by_severity.low).toBe(0)
      expect(stats.by_severity.medium).toBe(0)
      expect(stats.by_severity.high).toBe(0)
      expect(stats.by_severity.critical).toBe(0)
      expect(stats.recent_count).toBe(0)
    })

    it('should handle null userId gracefully', async () => {
      const stats = await getErrorStats(null)
      
      expect(stats).toBeDefined()
      expect(stats.total).toBeDefined()
    })

    it('should return correct structure', async () => {
      const stats = await getErrorStats('test-user-id')
      
      expect(stats).toHaveProperty('total')
      expect(stats).toHaveProperty('by_severity')
      expect(stats).toHaveProperty('recent_count')
      expect(stats.by_severity).toHaveProperty('low')
      expect(stats.by_severity).toHaveProperty('medium')
      expect(stats.by_severity).toHaveProperty('high')
      expect(stats.by_severity).toHaveProperty('critical')
    })
  })
})

