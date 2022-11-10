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
    'flex h-[75vh] w-screen items-center justify-center relative overflow-hidden',
    props.coverBackground
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
