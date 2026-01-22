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
      <div className={COMMON_CLASSES.workComponentLayout}>
        <OptimizedImage
          src={src}
          width={width}
          height={height}
          alt={alt}
          priority={priority}
          unoptimized={unoptimized}
        />
        <span className={COMMON_CLASSES.workCaption}>{alt}</span>
      </div>
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
    alt: description,
    priority,
  };

  return (
    <MDXComponentProvider
      className={clsx(COMMON_CLASSES.workComponentLayout, GRID_CLASSES.fullWidth)}
    >
      <div className="cet flex w-full flex-col justify-center gap-3 md:flex-row">
        <span>Before:</span>
        <OptimizedImage src={beforeSrc} {...sharedImageProps} />
        <span>After:</span>
        <OptimizedImage src={afterSrc} {...sharedImageProps} />
      </div>
      <span className={COMMON_CLASSES.workCaption}>{description}</span>
    </MDXComponentProvider>
  );
}

export { WorkSingleImage, WorkBeforeAfterImages };
