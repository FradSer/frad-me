import DotCircle from './DotCircle';
import Rectangle from './Rectangle';
import Triangle from './Triangle';

export default function Hero() {
  return (
    <div className="flex h-full flex-row tems-center justify-center">
      <h1 className="flex flex-col items-start justify-center text-3xl xl:text-5xl 2xl:text-7xl font-bold">
        <div className="relative">
          <div className="absolute bottom-24 -left-24 z-30">
            <Triangle />
          </div>
          Frad LEE
          <span className="text-gray-500"> is a self-taught crafter</span>
        </div>
        <div className="w-full flex">
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
          <DotCircle />
        </div>
      </h1>
    </div>
  );
}
