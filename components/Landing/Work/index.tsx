import { motion } from 'framer-motion';
import { Element } from 'react-scroll';

import workLinks from '../../../content/workLinks';
import WorkCard from './WorkCard';
import WorkTitle from './WorkTitle';

const MAX_DISPLAY_WORKS = 5;

export default function Work() {
  return (
    <section id="work">
      <Element
        name="work"
        className="grid w-screen grid-cols-2 gap-4 text-center"
      >
        <WorkTitle />
        {workLinks.slice(0, MAX_DISPLAY_WORKS).map((link) => (
          <WorkCard
            key={link.title}
            title={link.title}
            subTitle={link.subTitle}
            slug={link.slug}
            isFullScreen={link.isFullScreen}
            isCenter={link.isCenter}
          />
        ))}
      </Element>
    </section>
  );
}