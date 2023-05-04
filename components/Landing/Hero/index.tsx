import classNames from 'classnames'

import DotCircle from '@/components/Landing/Hero/DotCircle'
import Rectangle from '@/components/Landing/Hero/Rectangle'
import Triangle from '@/components/Landing/Hero/Triangle'
import ScrollLink from '@/components/common/ScrollLink'

interface IHeroProps {
  isWebXR?: boolean
}

function Hero({ isWebXR }: IHeroProps) {
  const heroH1 = classNames(
    'text-left text-2xl font-bold hover:cursor-default sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl'
  )

  return (
    <section className="m-auto flex h-auto min-h-screen w-screen items-center justify-center">
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
          <span className="text-gray-400"> is a self-taught craftier</span>
        </div>
        <div className="flex w-full">
          <span className="text-gray-400">who is eager to learn for</span>
          <Rectangle />
        </div>
        <span className="text-gray-400">advancement. Whether it&apos;s </span>
        <div>
          coding
          <span className="text-gray-400"> in a new language, </span>
        </div>
        <div>
          design
          <span className="text-gray-400"> with any tool whatsoever</span>
        </div>
        <div className="relative">
          <span className="text-gray-400">or building a </span>
          startup
          <ScrollLink destination="work">
            <DotCircle isInteractive={isWebXR ? false : true} />
          </ScrollLink>
        </div>
      </h1>
    </section>
  )
}

Hero.defaultProps = {
  isWebXR: false,
}

export default Hero
