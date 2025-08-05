import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { getFileContent, getAllPosts, getSinglePost } from '../../utils/mdx'

// Mock fs module
vi.mock('fs')
const mockFs = vi.mocked(fs)

// Mock mdx-bundler
vi.mock('mdx-bundler', () => ({
  bundleMDX: vi.fn(() => Promise.resolve({
    code: 'mock-compiled-code',
    frontmatter: { title: 'Test Post', description: 'Test Description' }
  }))
}))

describe('MDX Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFileContent', () => {
    it('should read file content correctly', () => {
      const mockContent = '# Test Content'
      mockFs.readFileSync.mockReturnValue(mockContent)

      const result = getFileContent('test.mdx')

      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), '/content/works', 'test.mdx'),
        'utf8'
      )
      expect(result).toBe(mockContent)
    })
  })

  describe('getAllPosts', () => {
    it('should return all MDX posts with frontmatter', () => {
      const mockFiles = ['post1.mdx', 'post2.md', 'not-post.txt']
      const mockContent = `---
title: Test Post
description: Test Description
---
# Content`

      mockFs.readdirSync.mockReturnValue(mockFiles as any)
      mockFs.readFileSync.mockReturnValue(mockContent)

      const result = getAllPosts()

      expect(result).toHaveLength(2) // Only .mdx and .md files
      expect(result[0]).toEqual({
        frontmatter: {
          title: 'Test Post',
          description: 'Test Description'
        },
        slug: 'post1'
      })
    })
  })

  describe('getSinglePost', () => {
    it('should compile and return MDX post', async () => {
      const mockContent = `---
title: Single Post
---
# Single Post Content`

      mockFs.readFileSync.mockReturnValue(mockContent)

      const result = await getSinglePost('test-post')

      expect(result).toEqual({
        code: 'mock-compiled-code',
        frontmatter: {
          title: 'Test Post',
          description: 'Test Description'
        }
      })
    })
  })
})