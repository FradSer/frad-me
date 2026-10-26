import { clsx } from 'clsx';
import Image from 'next/image';

import MDXComponentProvider from '@/components/WorkPage/MDXComponentProvider';
import { ImagePosition, type WorkBeforeAfterImagesProps, type WorkImageProps } from '@/types/work';
import { COMMON_CLASSES, GRID_CLASSES, IMAGE_POSITION_CLASSES } from '@/utils/constants';

// Shared optimized image component
function OptimizedImage({
  src,
  width,
  height,
  alt,
  priority = false,
  unoptimized = false,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  priority?: boolean;
  unoptimized?: boolean;
}) {
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      unoptimized={unoptimized}
      className="h-auto w-full"
      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 90vw, 1024px"
    />
  );
}

function WorkSingleImage({
  src,
  width,
  height,
  alt,
  position = ImagePosition.inline,
  unoptimized = false,
  priority = false,
}: Readonly<WorkImageProps>) {
  const workImageClass = clsx(COMMON_CLASSES.imageContainer, IMAGE_POSITION_CLASSES[position]);

  return (
    <MDXComponentProvider className={workImageClass}>
      <figure
        className={clsx(
          COMMON_CLASSES.workComponentLayout,
          position === ImagePosition.underH2 &&
            Number(height) > Number(width) &&
            'mx-auto max-w-md',
        )}
      >
        <OptimizedImage
          src={src}
          width={width}
          height={height}
          alt={alt}
          priority={priority}
          unoptimized={unoptimized}
        />
        <figcaption className={COMMON_CLASSES.workCaption}>{alt}</figcaption>
      </figure>
    </MDXComponentProvider>
  );
}

function WorkBeforeAfterImages({
  beforeSrc,
  afterSrc,
  width,
  height,
  description,
  priority = false,
}: Readonly<WorkBeforeAfterImagesProps>) {
  const sharedImageProps = {
    width,
    height,
    priority,
  };

  return (
    <MDXComponentProvider
      className={clsx(COMMON_CLASSES.workComponentLayout, GRID_CLASSES.fullWidth)}
    >
      <figure className={COMMON_CLASSES.workComponentLayout}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <figure className="min-w-0 space-y-3">
            <figcaption className="text-sm font-medium">Before</figcaption>
            <OptimizedImage src={beforeSrc} alt={`Before: ${description}`} {...sharedImageProps} />
          </figure>
          <figure className="min-w-0 space-y-3">
            <figcaption className="text-sm font-medium">After</figcaption>
            <OptimizedImage src={afterSrc} alt={`After: ${description}`} {...sharedImageProps} />
          </figure>
        </div>
        <figcaption className={COMMON_CLASSES.workCaption}>{description}</figcaption>
      </figure>
    </MDXComponentProvider>
  );
}

export { WorkBeforeAfterImages, WorkSingleImage };
