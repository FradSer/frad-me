import Image from 'next/image';

export default function WorkCover(props: { src?: string; title?: string }) {
  if (!props.src) return null;
  const imageAlt = 'Cover for' + props.title;
  return (
    <div className="w-screen">
      <Image
        src={props.src}
        width={1920}
        height={1080}
        alt={imageAlt}
        loading="eager"
      />
    </div>
  );
}
