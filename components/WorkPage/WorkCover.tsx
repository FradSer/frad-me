import Image from 'next/image';

export default function WorkCover(props: { src?: string; title?: string }) {
  if (!props.src) return null;
  const imageAlt = 'Cover for ' + props.title;
  return (
    <div className="flex h-[75vh] w-screen items-center justify-center">
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
