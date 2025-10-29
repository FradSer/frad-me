import WorkCard from '@/components/Landing/Work/WorkCard';
import WorkTitle from '@/components/Landing/Work/WorkTitle';

import workLinks from '@/content/workLinks';

const MAX_DISPLAY_WORKS = 6;

export default function Work() {
  return (
    <section id="work" className="grid w-screen grid-cols-2 md:grid-cols-2 gap-4 text-center">
      <WorkTitle />
      {workLinks.slice(0, MAX_DISPLAY_WORKS).map((link) => (
        <WorkCard
          key={link.title}
          title={link.title}
          subTitle={link.subTitle}
          slug={link.slug}
          cover={link.cover}
          isFullScreen={link.isFullScreen}
          isCenter={link.isCenter}
          isWIP={link.isWIP}
          externalLink={link.externalLink}
        />
      ))}
    </section>
  );
}
