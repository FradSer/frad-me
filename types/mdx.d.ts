declare module '*.mdx' {
  import type { ComponentType } from 'react';
  import type { WorkFrontmatter } from '@/types/work';

  export const metadata: WorkFrontmatter;
  const Content: ComponentType;
  export default Content;
}
