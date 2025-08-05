import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { bundleMDX } from 'mdx-bundler'

const ROOT = process.cwd()
const POSTS_PATH = path.join(ROOT, 'content', 'works')

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
    throw new Error(`Failed to read file ${filename}: ${error}`)
  }
}

const configureEsbuildPath = (): void => {
  const esbuildPath = process.platform === 'win32'
    ? path.join(ROOT, 'node_modules', 'esbuild', 'esbuild.exe')
    : path.join(ROOT, 'node_modules', 'esbuild', 'bin', 'esbuild')
  
  process.env.ESBUILD_BINARY_PATH = esbuildPath
}

const getCompiledMDX = async (content: string) => {
  configureEsbuildPath()
  
  // Add your remark and rehype plugins here
  const remarkPlugins: any[] = []
  const rehypePlugins: any[] = []

  try {
    return await bundleMDX({
      source: content,
      mdxOptions(options) {
        options.remarkPlugins = [...(options.remarkPlugins ?? []), ...remarkPlugins]
        options.rehypePlugins = [...(options.rehypePlugins ?? []), ...rehypePlugins]
        return options
      },
      esbuildOptions: (options) => {
        options.minify = true
        options.target = ['es2020']
        return options
      },
      cwd: POSTS_PATH,
    })
  } catch (error) {
    throw new Error(`Failed to compile MDX: ${error}`)
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
    throw new Error(`Failed to get post '${slug}': ${error}`)
  }
}

export const getAllPosts = (): Post[] => {
  try {
    return fs
      .readdirSync(POSTS_PATH)
      .filter((fileName) => /\.mdx?$/.test(fileName))
      .map((fileName) => {
        const source = getFileContent(fileName)
        const slug = fileName.replace(/\.mdx?$/, '')
        const { data } = matter(source)

        return {
          frontmatter: data as PostFrontmatter,
          slug,
        }
      })
      .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title))
  } catch (error) {
    throw new Error(`Failed to get all posts: ${error}`)
  }
}
