import fs from 'fs'
import matter from 'gray-matter'
import { bundleMDX } from 'mdx-bundler'
import path from 'path'

const ROOT = process.cwd()
const POSTS_PATH = path.join(ROOT, 'content', 'works')

// Error handling utility
const createError = (message: string, cause?: unknown) => {
  const error = new Error(message)
  if (cause instanceof Error) {
    error.cause = cause
  }
  return error
}

type PostFrontmatter = {
  title: string
  description: string
  cover: string
  [key: string]: any
}

type Post = {
  frontmatter: PostFrontmatter
  slug: string
}

type CompiledPost = {
  code: string
  frontmatter: PostFrontmatter
}

const getFileContent = (filename: string): string => {
  try {
    return fs.readFileSync(path.join(POSTS_PATH, filename), 'utf8')
  } catch (error) {
    throw createError(`Failed to read file ${filename}`, error)
  }
}

const configureEsbuildPath = (): void => {
  const binaryName = process.platform === 'win32' ? 'esbuild.exe' : 'bin/esbuild'
  const esbuildPath = path.join(ROOT, 'node_modules', 'esbuild', binaryName)
  process.env.ESBUILD_BINARY_PATH = esbuildPath
}

const getCompiledMDX = async (content: string) => {
  configureEsbuildPath()

  const remarkPlugins: any[] = []
  const rehypePlugins: any[] = []

  try {
    return await bundleMDX({
      source: content,
      mdxOptions: (options) => ({
        ...options,
        remarkPlugins: [...(options.remarkPlugins ?? []), ...remarkPlugins],
        rehypePlugins: [...(options.rehypePlugins ?? []), ...rehypePlugins],
      }),
      esbuildOptions: (options) => ({
        ...options,
        minify: true,
        target: ['es2020'],
      }),
      cwd: POSTS_PATH,
    })
  } catch (error) {
    throw createError('Failed to compile MDX', error)
  }
}

export const getSinglePost = async (slug: string): Promise<CompiledPost> => {
  try {
    const source = getFileContent(`${slug}.mdx`)
    const { code, frontmatter } = await getCompiledMDX(source)

    return {
      code,
      frontmatter: frontmatter as PostFrontmatter,
    }
  } catch (error) {
    throw createError(`Failed to get post '${slug}'`, error)
  }
}

const processPostFile = (fileName: string): Post => {
  const source = getFileContent(fileName)
  const slug = fileName.replace(/\.mdx?$/, '')
  const { data } = matter(source)

  return {
    frontmatter: data as PostFrontmatter,
    slug,
  }
}

export const getAllPosts = (): Post[] => {
  try {
    return fs
      .readdirSync(POSTS_PATH)
      .filter((fileName) => /\.mdx?$/.test(fileName))
      .map(processPostFile)
      .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title))
  } catch (error) {
    throw createError('Failed to get all posts', error)
  }
}
