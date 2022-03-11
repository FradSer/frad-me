import classNames from 'classnames';

import ScrollLink from '../../common/ScrollLink';
import DotCircle from './DotCircle';
import Rectangle from './Rectangle';
import Triangle from './Triangle';

export default function Hero() {
  const heroH1 = classNames(
    'text-left text-2xl font-bold hover:cursor-default sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl'
  );

  return (
    <section className="m-auto flex h-auto items-center justify-center">
      <h1
        className={classNames(
          'flex flex-col items-start justify-center',
          heroH1
        )}
      >
        <div className="relative">
          <div className="absolute bottom-10 -left-12 z-30 sm:-left-16 sm:bottom-12 lg:-left-24 lg:bottom-16 2xl:-left-28 2xl:bottom-20">
            <Triangle />
          </div>
          Frad LEE
          <span className="text-gray-400"> is a self-taught crafter</span>
        </div>
        <div className="flex w-full">
          <span className="text-gray-400">who eager to learn for</span>
          <Rectangle />
        </div>
        <span className="text-gray-400">advancement. Whether it&apos;s </span>
        <div>
          coding
          <span className="text-gray-400"> with a new language, </span>
        </div>
        <div>
          design
          <span className="text-gray-400"> with any tools whatsoever</span>
        </div>
        <div className="relative">
          <span className="text-gray-400">or building a </span>
          startup
          <ScrollLink destination="work">
            <DotCircle />
          </ScrollLink>
        </div>
      </h1>
    </section>
  );
}
