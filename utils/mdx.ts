import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { bundleMDX } from 'mdx-bundler';
import type { WorkFrontmatter } from '@/types/work';

const ROOT = process.cwd();
const POSTS_PATH = path.join(ROOT, 'content', 'works');

/**
 * Creates a standardized error with optional cause
 */
const createError = (message: string, cause?: unknown): Error =>
  Object.assign(new Error(message), {
    cause: cause instanceof Error ? cause : undefined,
  });

/**
 * Represents a blog post with its metadata
 */
export interface Post {
  frontmatter: WorkFrontmatter;
  slug: string;
}

/**
 * Represents a compiled MDX post ready for rendering
 */
export interface CompiledPost {
  code: string;
  frontmatter: WorkFrontmatter;
}

/**
 * Type definitions for MDX plugins - using Parameters to extract from bundleMDX
 */
type BundleMDXParams = Parameters<typeof bundleMDX>[0];
type MDXOptionsFunction = NonNullable<BundleMDXParams['mdxOptions']>;
type MDXOptionsParams = Parameters<MDXOptionsFunction>[0];
type RemarkPlugin = NonNullable<MDXOptionsParams['remarkPlugins']>[number];
type RehypePlugin = NonNullable<MDXOptionsParams['rehypePlugins']>[number];

/**
 * Reads a file from the posts directory with error handling
 */
const getFileContent = (filename: string): string => {
  try {
    return fs.readFileSync(path.join(POSTS_PATH, filename), 'utf8');
  } catch (error) {
    throw createError(`Failed to read file ${filename}`, error);
  }
};

/**
 * Configures the esbuild binary path for MDX compilation
 */
const configureEsbuildPath = (): void => {
  const binaryName =
    process.platform === 'win32' ? 'esbuild.exe' : 'bin/esbuild';
  const esbuildPath = path.join(ROOT, 'node_modules', 'esbuild', binaryName);
  process.env.ESBUILD_BINARY_PATH = esbuildPath;
};

/**
 * Compiles MDX content to executable JavaScript code
 *
 * @param content - The raw MDX content to compile
 * @returns Promise that resolves to bundled MDX code and frontmatter
 */
const getCompiledMDX = async (content: string) => {
  configureEsbuildPath();

  // Define plugin arrays with proper typing
  const remarkPlugins: RemarkPlugin[] = [];
  const rehypePlugins: RehypePlugin[] = [];

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
    });
  } catch (error) {
    throw createError('Failed to compile MDX', error);
  }
};

/**
 * Retrieves and compiles a single MDX post by slug
 *
 * @param slug - The slug identifier for the post (filename without extension)
 * @returns Promise that resolves to compiled post with code and frontmatter
 */
export const getSinglePost = async (slug: string): Promise<CompiledPost> => {
  try {
    const source = getFileContent(`${slug}.mdx`);
    const { code, frontmatter } = await getCompiledMDX(source);

    return {
      code,
      frontmatter: frontmatter as WorkFrontmatter,
    };
  } catch (error) {
    throw createError(`Failed to get post '${slug}'`, error);
  }
};

/**
 * Processes a single post file to extract frontmatter and slug
 */
const processPostFile = (fileName: string): Post => {
  const source = getFileContent(fileName);
  const slug = fileName.replace(/\.mdx?$/, '');
  const { data } = matter(source);

  return {
    frontmatter: data as WorkFrontmatter,
    slug,
  };
};

/**
 * Retrieves all available posts from the content directory
 *
 * @returns Array of posts sorted alphabetically by title
 */
export const getAllPosts = (): Post[] => {
  try {
    return fs
      .readdirSync(POSTS_PATH)
      .filter((fileName) => /\.mdx?$/.test(fileName))
      .map(processPostFile)
      .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
  } catch (error) {
    throw createError('Failed to get all posts', error);
  }
};
