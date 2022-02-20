import workLinks from '../../../content/workLinks';
import WorkCard from './WorkCard';

const MAX_DISPLAY_WORKS = 5;

export default function Work() {
  return (
    <section className="w-screen grid gap-4 grid-cols-2">
      <h2 className="col-span-2 text-[16rem]">work</h2>
      {workLinks.slice(0, MAX_DISPLAY_WORKS).map((link) => (
        <WorkCard
          key={link.title}
          title={link.title}
          subTitle={link.subTitle}
          slug={link.slug}
          background={link.background}
          isFullScreen={link.isFullScreen}
          isCenter={link.isCenter}
        />
      ))}
    </section>
  );
}
