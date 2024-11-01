import fs from 'fs'
import matter from 'gray-matter'
import { bundleMDX } from 'mdx-bundler'
import path from 'path'

export const ROOT = process.cwd()
export const POSTS_PATH = path.join(ROOT, '/content/works')

export const getFileContent = (filename: string) => {
  return fs.readFileSync(path.join(POSTS_PATH, filename), 'utf8')
}

const getCompiledMDX = async (content: string) => {
  if (process.platform === 'win32') {
    process.env.ESBUILD_BINARY_PATH = path.join(
      ROOT,
      'node_modules',
      'esbuild',
      'esbuild.exe',
    )
  } else {
    process.env.ESBUILD_BINARY_PATH = path.join(
      ROOT,
      'node_modules',
      'esbuild',
      'bin',
      'esbuild',
    )
  }
  // Add your remark and rehype plugins here
  const remarkPlugins: any = []
  const rehypePlugins: any = []

  try {
    return await bundleMDX({
      source: content,
      mdxOptions(options) {
        options.remarkPlugins = [
          ...(options.remarkPlugins ?? []),
          ...remarkPlugins,
        ]
        options.rehypePlugins = [
          ...(options.rehypePlugins ?? []),
          ...rehypePlugins,
        ]
        return options
      },
      esbuildOptions: (options) => {
        options.minify = true
        options.target = ['es2020']
        return options
      },
      cwd: POSTS_PATH,
    })
  } catch (error: any) {
    throw new Error(error)
  }
}

export const getSinglePost = async (slug: string) => {
  const source = getFileContent(`${slug}.mdx`)
  const { code, frontmatter } = await getCompiledMDX(source)

  return {
    code,
    frontmatter,
  }
}

export const getAllPosts = () => {
  return fs
    .readdirSync(POSTS_PATH)
    .filter((path) => /\.mdx?$/.test(path))
    .map((fileName) => {
      console.log(fileName)
      const source = getFileContent(fileName)
      const slug = fileName.replace(/\.mdx?$/, '')
      const { data } = matter(source)

      return {
        frontmatter: data,
        slug: slug,
      }
    })
}
