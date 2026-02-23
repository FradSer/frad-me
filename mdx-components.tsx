import type { ReactNode } from 'react';
import Topography from '@/components/WorkPage/BearyChat/Topography';
import ComfortableFontSFormula from '@/components/WorkPage/EyeProtectionDesignHandbook/ComfortableFontSFormula';
import ComfortableFontYong from '@/components/WorkPage/EyeProtectionDesignHandbook/ComfortableFontYong';
import EyeComfortDFormula from '@/components/WorkPage/EyeProtectionDesignHandbook/EyeComfortDFormula';
import { Blockquote, H1, H2, H3, Line, OL, P, UL } from '@/components/WorkPage/MDXComponents';
import { WorkBeforeAfterImages, WorkSingleImage } from '@/components/WorkPage/WorkImage';

export type MDXComponents = Record<string, React.ComponentType<any> | ReactNode>;

const components: MDXComponents = {
  blockquote: Blockquote,
  h1: H1,
  h2: H2,
  h3: H3,
  line: Line,
  ol: OL,
  p: P,
  ul: UL,
  WorkSingleImage,
  WorkBeforeAfterImages,
  Topography,
  ComfortableFontSFormula,
  ComfortableFontYong,
  EyeComfortDFormula,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
