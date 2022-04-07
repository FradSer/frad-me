import classNames from 'classnames';
import Image from 'next/image';

interface IWorkCoverProps {
  src?: string;
  title?: string;
  coverBackground?: string;
}

function WorkCover(props: IWorkCoverProps) {
  if (!props.src) return null;

  const imageAlt = 'Cover for ' + props.title;
  const workCoverClass = classNames(
    'flex h-[75vh] w-screen items-center justify-center',
    props.coverBackground
  );

  return (
    <div className={workCoverClass}>
      <div className="relative h-full w-screen">
        <Image
          src={props.src}
          alt={imageAlt}
          loading="eager"
          layout="fill"
          objectFit="cover"
        />
      </div>
    </div>
  );
}

export default WorkCover;
