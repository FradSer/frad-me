import { Link } from 'react-scroll';

import DotCircle from './DotCircle';
import Rectangle from './Rectangle';
import Triangle from './Triangle';

export default function Hero() {
  return (
    <section className="m-auto flex h-auto items-center justify-center">
      <h1 className="flex flex-col items-start justify-center text-left text-2xl font-bold hover:cursor-default sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
        <div className="relative">
          <div className="absolute bottom-24 -left-24 z-30">
            <Triangle />
          </div>
          Frad LEE
          <span className="text-gray-500"> is a self-taught crafter</span>
        </div>
        <div className="flex w-full">
          <span className="text-gray-500">who eager to learn for</span>
          <Rectangle />
        </div>
        <span className="text-gray-500">advancement. Whether it&apos;s </span>
        <div>
          coding
          <span className="text-gray-500"> with a new language, </span>
        </div>
        <div>
          design
          <span className="text-gray-500"> with any tools whatsoever</span>
        </div>
        <div className="relative">
          <span className="text-gray-500">or building a </span>
          startup
          <Link to="work" spy={true} smooth={true} duration={500}>
            <DotCircle />
          </Link>
        </div>
      </h1>
    </section>
  );
}
