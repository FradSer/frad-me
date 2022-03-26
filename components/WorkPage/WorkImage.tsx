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

function WorkImage(props: IWorkImageProps) {
  // * Styling
  const workImageClass = classNames('w-full', {
    'col-span-16 md:col-span-5': props.position === ImagePosition.inline,
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

WorkImage.defaultProps = {
  position: ImagePosition.inline,
};

export default WorkImage;
