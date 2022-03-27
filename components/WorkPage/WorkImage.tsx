import classNames from 'classnames';
import Image from 'next/image';

import MDXComponentProvider from './MDXComponentProvider';

type IWorkImageProps = {
  src: string;
  width: number;
  height: number;
  alt: string;
  position: ImagePosition;
};

enum ImagePosition {
  inline = 'inline',
  underH2 = 'underH2',
  fullScreen = 'fullScreen',
}

function WorkSingleImage(props: IWorkImageProps) {
  // * Styling
  const workImageClass = classNames('w-full', {
    'col-span-16 col-start-1 md:col-span-10 md:col-start-7':
      props.position === ImagePosition.inline,
    'col-span-16': props.position === ImagePosition.fullScreen,
    'col-span-16 md:col-span-5 mt-0 md:mt-[-3.25rem]':
      props.position === ImagePosition.underH2,
  });

  // * Render
  return (
    <MDXComponentProvider className={workImageClass}>
      <div className="work-component-layout">
        <Image
          src={props.src}
          width={props.width}
          height={props.height}
          alt={props.alt}
          loading="eager"
        />
        <span className="work-caption">{props.alt}</span>
      </div>
    </MDXComponentProvider>
  );
}

WorkSingleImage.defaultProps = {
  position: ImagePosition.inline,
};

interface IWorkBeforeAfterImagesProps {
  beforeSrc: string;
  afterSrc: string;
  width: number;
  height: number;
  description: string;
}

function WorkBeforeAfterImages(props: IWorkBeforeAfterImagesProps) {
  return (
    <MDXComponentProvider className="work-component-layout col-span-16">
      <div className="cet flex w-full flex-col justify-center gap-3 md:flex-row">
        <span>Befor:</span>
        <Image
          src={props.beforeSrc}
          width={props.width}
          height={props.height}
          alt={props.alt}
          loading="eager"
        />
        <span>After:</span>
        <Image
          src={props.afterSrc}
          width={props.width}
          height={props.height}
          alt={props.alt}
          loading="eager"
        />
      </div>
      <span className="work-caption">{props.description}</span>
    </MDXComponentProvider>
  );
}

export { WorkSingleImage, WorkBeforeAfterImages };
