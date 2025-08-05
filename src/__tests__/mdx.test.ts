import { describe, it, expect, beforeEach } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import { getFileContent, getAllPosts, getSinglePost } from '../../utils/mdx'

// Mock fs module
jest.mock('fs')
const mockFs = jest.mocked(fs)

// Test constants
const MOCK_COMPILED_CODE = 'mock-compiled-code'
const MOCK_FRONTMATTER = { title: 'Test Post', description: 'Test Description' }
const MOCK_CONTENT = '# Test Content'
const MOCK_MDX_CONTENT = `---
title: Test Post
description: Test Description
---
# Content`

// Mock mdx-bundler
jest.mock('mdx-bundler', () => ({
  bundleMDX: jest.fn(() => Promise.resolve({
    code: MOCK_COMPILED_CODE,
    frontmatter: MOCK_FRONTMATTER
  }))
}))

describe('MDX Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getFileContent', () => {
    it('should read file content correctly', () => {
      mockFs.readFileSync.mockReturnValue(MOCK_CONTENT)

      const result = getFileContent('test.mdx')

      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), '/content/works', 'test.mdx'),
        'utf8'
      )
      expect(result).toBe(MOCK_CONTENT)
    })
  })

  describe('getAllPosts', () => {
    it('should return all MDX posts with frontmatter', () => {
      const mockFiles = ['post1.mdx', 'post2.md', 'not-post.txt']

      mockFs.readdirSync.mockReturnValue(mockFiles as any)
      mockFs.readFileSync.mockReturnValue(MOCK_MDX_CONTENT)

      const result = getAllPosts()

      expect(result).toHaveLength(2) // Only .mdx and .md files
      expect(result[0]).toEqual({
        frontmatter: MOCK_FRONTMATTER,
        slug: 'post1'
      })
    })
  })

  describe('getSinglePost', () => {
    it('should compile and return MDX post', async () => {
      mockFs.readFileSync.mockReturnValue(MOCK_MDX_CONTENT)

      const result = await getSinglePost('test-post')

      expect(result).toEqual({
        code: MOCK_COMPILED_CODE,
        frontmatter: MOCK_FRONTMATTER
      })
    })
  })
})