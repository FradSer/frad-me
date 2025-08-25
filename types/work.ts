export interface WorkFrontmatter {
  cover?: string;
  coverBackground?: string;
  title: string;
  description: string;
  platforms?: string[];
  contributors?: string[];
  site?: string;
  nextWork?: string;
}

export interface WorkPageProps {
  code: string;
  frontmatter: WorkFrontmatter;
}

export interface WorkImageProps {
  src: string;
  width: number;
  height: number;
  alt: string;
  position?: ImagePosition;
  unoptimized?: boolean;
  priority?: boolean;
}

export enum ImagePosition {
  inline = 'inline',
  underH2 = 'underH2',
  fullScreen = 'fullScreen',
}

export interface WorkBeforeAfterImagesProps {
  beforeSrc: string;
  afterSrc: string;
  width: number;
  height: number;
  description: string;
  priority?: boolean;
}
