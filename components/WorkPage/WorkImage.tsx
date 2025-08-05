import Image from 'next/image'

import classNames from 'classnames'

import MDXComponentProvider from '@/components/WorkPage/MDXComponentProvider'
import { WorkImageProps, WorkBeforeAfterImagesProps, ImagePosition } from '@/types/work'

function WorkSingleImage({
  src,
  width,
  height,
  alt,
  position = ImagePosition.inline,
  unoptimized = false,
}: Readonly<WorkImageProps>) {
  // * Styling
  const workImageClass = classNames('w-full overflow-hidden', {
    'col-span-16 col-start-1 md:col-span-10 md:col-start-7':
      position === ImagePosition.inline,
    'col-span-16': position === ImagePosition.fullScreen,
    'col-span-16 md:col-span-5 mt-0 md:mt-[-3.25rem]':
      position === ImagePosition.underH2,
  })

  // * Render
  return (
    <MDXComponentProvider className={workImageClass}>
      <div className="work-component-layout">
        <Image
          src={src}
          width={width}
          height={height}
          alt={alt}
          loading="lazy"
          unoptimized={unoptimized}
        />
        <span className="work-caption">{alt}</span>
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
}: Readonly<WorkBeforeAfterImagesProps>) {
  return (
    <MDXComponentProvider className="work-component-layout col-span-16">
      <div className="cet flex w-full flex-col justify-center gap-3 md:flex-row">
        <span>Before:</span>
        <Image
          src={beforeSrc}
          width={width}
          height={height}
          alt={description}
          loading="lazy"
        />
        <span>After:</span>
        <Image
          src={afterSrc}
          width={width}
          height={height}
          alt={description}
          loading="lazy"
        />
      </div>
      <span className="work-caption">{description}</span>
    </MDXComponentProvider>
  )
}

export { WorkSingleImage, WorkBeforeAfterImages }
