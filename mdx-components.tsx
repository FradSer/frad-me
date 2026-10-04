import Topography from '@/components/WorkPage/BearyChat/Topography';
import ComfortableFontSFormula from '@/components/WorkPage/EyeProtectionDesignHandbook/ComfortableFontSFormula';
import ComfortableFontYong from '@/components/WorkPage/EyeProtectionDesignHandbook/ComfortableFontYong';
import EyeComfortDFormula from '@/components/WorkPage/EyeProtectionDesignHandbook/EyeComfortDFormula';
import { Blockquote, H1, H2, H3, Line, OL, P, UL } from '@/components/WorkPage/MDXComponents';
import { WorkBeforeAfterImages, WorkSingleImage } from '@/components/WorkPage/WorkImage';

const components = {
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

export type MDXComponents = typeof components;

export function useMDXComponents(): MDXComponents {
  return components;
}
