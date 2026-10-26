import { clsx } from 'clsx';
import Image from 'next/image';

interface IWorkCoverProps {
  src?: string;
  title?: string;
  coverBackground?: string;
}

function WorkCover(props: Readonly<IWorkCoverProps>) {
  if (!props.src) return null;

  const imageAlt = `Cover for ${props.title}`;
  const workCoverClass = clsx(
    'relative flex h-[52svh] min-h-64 max-h-[38rem] w-full items-center justify-center overflow-hidden',
    props.coverBackground,
  );

  return (
    <div className={workCoverClass}>
      <Image
        src={props.src}
        alt={imageAlt}
        loading="eager"
        fill
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}

export default WorkCover;
