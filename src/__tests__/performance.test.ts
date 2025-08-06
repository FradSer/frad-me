import { measureChunkLoad } from '@/utils/performance'

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})
const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {})

const TEST_CHUNK_NAME = 'test-chunk'
const TEST_COMPONENT = { default: 'test-component' }

describe('Performance Utils', () => {
  let mockTime = 0

  beforeEach(() => {
    jest.clearAllMocks()
    mockTime = 0
    jest.spyOn(performance, 'now').mockImplementation(() => (mockTime += 100))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const setEnvironment = (env: string) => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = env
    return () => {
      process.env.NODE_ENV = originalEnv
    }
  }

  describe('measureChunkLoad', () => {
    it('measures successful chunk loading', async () => {
      const mockImport = jest.fn().mockResolvedValue(TEST_COMPONENT)

      const result = await measureChunkLoad(TEST_CHUNK_NAME, mockImport)

      expect(result).toEqual(TEST_COMPONENT)
      expect(mockImport).toHaveBeenCalledTimes(1)
    })

    it('logs success in development mode', async () => {
      const restoreEnv = setEnvironment('development')
      const mockImport = jest.fn().mockResolvedValue(TEST_COMPONENT)

      await measureChunkLoad(TEST_CHUNK_NAME, mockImport)

      expect(mockConsoleLog).toHaveBeenCalledWith(
        `✅ ${TEST_CHUNK_NAME} loaded in 100.00ms`,
      )

      restoreEnv()
    })

    it('does not log in production mode', async () => {
      const restoreEnv = setEnvironment('production')
      const mockImport = jest.fn().mockResolvedValue(TEST_COMPONENT)

      await measureChunkLoad(TEST_CHUNK_NAME, mockImport)

      expect(mockConsoleLog).not.toHaveBeenCalled()

      restoreEnv()
    })

    it('handles chunk loading errors and rethrows', async () => {
      const ERROR_MESSAGE = 'Load failed'
      const testError = new Error(ERROR_MESSAGE)
      const mockImport = jest.fn().mockRejectedValue(testError)

      await expect(
        measureChunkLoad(TEST_CHUNK_NAME, mockImport),
      ).rejects.toThrow(ERROR_MESSAGE)
    })

    it('logs errors in development mode', async () => {
      const restoreEnv = setEnvironment('development')
      const ERROR_MESSAGE = 'Load failed'
      const testError = new Error(ERROR_MESSAGE)
      const mockImport = jest.fn().mockRejectedValue(testError)

      try {
        await measureChunkLoad(TEST_CHUNK_NAME, mockImport)
      } catch {}

      expect(mockConsoleError).toHaveBeenCalledWith(
        `❌ ${TEST_CHUNK_NAME} failed after 100.00ms:`,
        ERROR_MESSAGE,
      )

      restoreEnv()
    })

    it('handles non-Error objects gracefully', async () => {
      const restoreEnv = setEnvironment('development')
      const mockImport = jest.fn().mockRejectedValue('String error')

      try {
        await measureChunkLoad(TEST_CHUNK_NAME, mockImport)
      } catch {}

      expect(mockConsoleError).toHaveBeenCalledWith(
        `❌ ${TEST_CHUNK_NAME} failed after 100.00ms:`,
        'Unknown error',
      )

      restoreEnv()
    })
  })
})
