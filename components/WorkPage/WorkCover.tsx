import Image from 'next/image';

import classNames from 'classnames';

interface IWorkCoverProps {
  src?: string;
  title?: string;
  coverBackground?: string;
}

function WorkCover(props: Readonly<IWorkCoverProps>) {
  if (!props.src) return null;

  const imageAlt = 'Cover for ' + props.title;
  const workCoverClass = classNames(
    'flex h-[75vh] w-screen items-center justify-center relative overflow-hidden',
    props.coverBackground,
  );

  return (
    <div className={workCoverClass}>
      <Image
        src={props.src}
        alt={imageAlt}
        loading="eager"
        fill
        className="object-cover"
      />
    </div>
  );
}

export default WorkCover;
