import classNames from 'classnames'

import DotCircle from '@/components/Landing/Hero/DotCircle'
import Rectangle from '@/components/Landing/Hero/Rectangle'
import Triangle from '@/components/Landing/Hero/Triangle'
import ScrollLink from '@/components/common/ScrollLink'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

interface IHeroProps {
  isWebXR?: boolean
}

// Combine the text content for speaking
const heroText = `
Frad LEE is a self-taught craftier
who is eager to learn for advancement. Whether it's
coding in a new language,
design with any tool whatsoever
or building a startup.
`

function Hero({ isWebXR = false }: Readonly<IHeroProps>) {
  const { isSupported, isSpeaking, speak, stop } = useSpeechSynthesis()

  const heroH1 = classNames(
    'text-left text-2xl font-bold hover:cursor-default sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl',
  )

  return (
    <section className="m-auto flex h-auto min-h-screen w-screen items-center justify-center">
      <h1
        className={classNames(
          'relative flex flex-col items-start justify-center',
          heroH1,
        )}
      >
        {isSupported && (
          <button
            onClick={isSpeaking ? stop : () => speak(heroText, 'Fred')}
            className="absolute -left-10 top-1 z-10 rounded bg-gray-200 p-1 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            aria-label={isSpeaking ? 'Stop speaking' : 'Speak text'}
          >
            {isSpeaking ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M2 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm14 0H4v12h12V4Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M6.3 2.841A1.5 1.5 0 0 0 4 4.11V15.89a1.5 1.5 0 0 0 2.3 1.269l9.344-5.89a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
              </svg>
            )}
          </button>
        )}
        <div className="relative">
          <div className="absolute -left-12 bottom-10 z-30 sm:-left-16 sm:bottom-12 lg:-left-24 lg:bottom-16 2xl:-left-28 2xl:bottom-20">
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
          {/*
           */}
          <span className="text-gray-400"> in a new language,</span>
        </div>
        <div>
          design
          {/*
           */}
          <span className="text-gray-400"> with any tool whatsoever</span>
        </div>
        <div className="relative">
          <span className="text-gray-400">or building a </span>
          startup
          <ScrollLink destination="work">
            <DotCircle isInteractive={!isWebXR} />
          </ScrollLink>
        </div>
      </h1>
    </section>
  )
}

export default Hero
