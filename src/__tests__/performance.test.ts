import { measureChunkLoad } from '@/utils/performance'

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

const TEST_CHUNK_NAME = 'test-chunk'
const TEST_COMPONENT = { default: 'test-component' }

describe('Performance Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    let mockTime = 0
    jest.spyOn(performance, 'now').mockImplementation(() => mockTime += 100)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('measureChunkLoad', () => {
    it('measures successful chunk loading', async () => {
      const mockImport = jest.fn().mockResolvedValue(TEST_COMPONENT)
      
      const result = await measureChunkLoad(TEST_CHUNK_NAME, mockImport)
      
      expect(result).toEqual(TEST_COMPONENT)
      expect(mockImport).toHaveBeenCalled()
    })

    it('logs success in development mode', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const mockImport = jest.fn().mockResolvedValue(TEST_COMPONENT)
      
      await measureChunkLoad(TEST_CHUNK_NAME, mockImport)
      
      expect(mockConsoleLog).toHaveBeenCalledWith(`✅ ${TEST_CHUNK_NAME} loaded in 100.00ms`)
      
      process.env.NODE_ENV = originalEnv
    })

    it('handles chunk loading errors', async () => {
      const ERROR_MESSAGE = 'Load failed'
      const testError = new Error(ERROR_MESSAGE)
      const mockImport = jest.fn().mockRejectedValue(testError)
      
      await expect(measureChunkLoad(TEST_CHUNK_NAME, mockImport)).rejects.toThrow(ERROR_MESSAGE)
    })

    it('logs errors in development mode', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const ERROR_MESSAGE = 'Load failed'
      const testError = new Error(ERROR_MESSAGE)
      const mockImport = jest.fn().mockRejectedValue(testError)
      
      try {
        await measureChunkLoad(TEST_CHUNK_NAME, mockImport)
      } catch {}
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        `❌ ${TEST_CHUNK_NAME} failed after 100.00ms:`,
        ERROR_MESSAGE
      )
      
      process.env.NODE_ENV = originalEnv
    })
  })
})