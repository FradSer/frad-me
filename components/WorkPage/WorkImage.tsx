import Image from 'next/image'

import {
  WorkImageProps,
  WorkBeforeAfterImagesProps,
  ImagePosition,
} from '@/types/work'
import classNames from 'classnames'

import MDXComponentProvider from '@/components/WorkPage/MDXComponentProvider'

import { IMAGE_POSITION_CLASSES, COMMON_CLASSES } from '@/utils/constants'

// Shared optimized image component
function OptimizedImage({
  src,
  width,
  height,
  alt,
  priority = false,
  unoptimized = false,
}: {
  src: string
  width: number
  height: number
  alt: string
  priority?: boolean
  unoptimized?: boolean
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
  )
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
  const workImageClass = classNames(
    COMMON_CLASSES.imageContainer,
    IMAGE_POSITION_CLASSES[position],
  )

  return (
    <MDXComponentProvider className={workImageClass}>
      <div className="work-component-layout">
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
  )
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
  }

  return (
    <MDXComponentProvider className="work-component-layout col-span-16">
      <div className="cet flex w-full flex-col justify-center gap-3 md:flex-row">
        <span>Before:</span>
        <OptimizedImage src={beforeSrc} {...sharedImageProps} />
        <span>After:</span>
        <OptimizedImage src={afterSrc} {...sharedImageProps} />
      </div>
      <span className={COMMON_CLASSES.workCaption}>{description}</span>
    </MDXComponentProvider>
  )
}

export { WorkSingleImage, WorkBeforeAfterImages }
