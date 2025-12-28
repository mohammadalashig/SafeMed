import { rateLimit, RATE_LIMITS, resetRateLimitStore } from '../rate-limit'

// Mock Date.now to control time in tests
const mockDateNow = jest.fn()
jest.spyOn(Date, 'now').mockImplementation(mockDateNow)

describe('rateLimit', () => {
  beforeEach(() => {
    // Reset mock time to a fixed point
    mockDateNow.mockReturnValue(1000000)
    // Clear the rate limit store between tests
    resetRateLimitStore()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('should allow requests within the limit', async () => {
    const identifier = 'test-user-1'
    const config = {
      identifier,
      windowMs: 1000, // 1 second
      maxRequests: 5,
    }

    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      const result = await rateLimit(config)
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(5 - i - 1)
    }
  })

  it('should block requests exceeding the limit', async () => {
    const identifier = 'test-user-2'
    const config = {
      identifier,
      windowMs: 1000,
      maxRequests: 3,
    }

    // Make 3 requests (should succeed)
    for (let i = 0; i < 3; i++) {
      const result = await rateLimit(config)
      expect(result.success).toBe(true)
    }

    // 4th request should fail
    const result = await rateLimit(config)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.error).toBeDefined()
  })

  it('should reset the limit after the window expires', async () => {
    const identifier = 'test-user-3'
    const config = {
      identifier,
      windowMs: 1000,
      maxRequests: 2,
    }

    // Make 2 requests (should succeed)
    const result1 = await rateLimit(config)
    expect(result1.success).toBe(true)

    const result2 = await rateLimit(config)
    expect(result2.success).toBe(true)

    // 3rd should fail
    const result3 = await rateLimit(config)
    expect(result3.success).toBe(false)

    // Advance time by 1001ms (past the window)
    mockDateNow.mockReturnValue(1000000 + 1001)

    // Should now succeed again
    const result4 = await rateLimit(config)
    expect(result4.success).toBe(true)
    expect(result4.remaining).toBe(1)
  })

  it('should track different identifiers separately', async () => {
    const config1 = {
      identifier: 'user-1',
      windowMs: 1000,
      maxRequests: 2,
    }

    const config2 = {
      identifier: 'user-2',
      windowMs: 1000,
      maxRequests: 2,
    }

    // Both users should be able to make 2 requests
    const result1a = await rateLimit(config1)
    expect(result1a.success).toBe(true)

    const result2a = await rateLimit(config2)
    expect(result2a.success).toBe(true)

    const result1b = await rateLimit(config1)
    expect(result1b.success).toBe(true)

    const result2b = await rateLimit(config2)
    expect(result2b.success).toBe(true)

    // Both should now be at limit
    const result1c = await rateLimit(config1)
    expect(result1c.success).toBe(false)

    const result2c = await rateLimit(config2)
    expect(result2c.success).toBe(false)
  })

  it('should return correct reset time', async () => {
    const identifier = 'test-user-4'
    const config = {
      identifier,
      windowMs: 5000,
      maxRequests: 1,
    }

    mockDateNow.mockReturnValue(1000000)
    const result = await rateLimit(config)
    
    expect(result.success).toBe(true)
    expect(result.resetAt).toBe(1000000 + 5000)
  })
})

describe('RATE_LIMITS constants', () => {
  it('should have correct AI_ANALYSIS limits', () => {
    expect(RATE_LIMITS.AI_ANALYSIS.maxRequests).toBe(10)
    expect(RATE_LIMITS.AI_ANALYSIS.windowMs).toBe(60 * 60 * 1000) // 1 hour
  })

  it('should have correct API_REQUEST limits', () => {
    expect(RATE_LIMITS.API_REQUEST.maxRequests).toBe(60)
    expect(RATE_LIMITS.API_REQUEST.windowMs).toBe(60 * 1000) // 1 minute
  })

  it('should have correct AUTH limits', () => {
    expect(RATE_LIMITS.AUTH.maxRequests).toBe(5)
    expect(RATE_LIMITS.AUTH.windowMs).toBe(15 * 60 * 1000) // 15 minutes
  })
})

