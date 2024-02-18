import Image from 'next/image'
import Link from 'next/link'

import classNames from 'classnames'
import { motion, useAnimationControls } from 'framer-motion'

import useMouseContext from '@/hooks/useMouseContext'

import { primaryTransition } from '@/utils/motion/springTransitions'

interface IWorkCardProps {
  title: string
  subTitle: string
  slug: string
  cover: string
  isFullScreen?: boolean
  isCenter?: boolean
  isWIP?: boolean
}

function WorkCard(props: IWorkCardProps) {
  // * Styling
  const linkClass = classNames(
    'relative flex w-full items-center justify-center overflow-hidden',
    {
      'col-span-2 aspect-100/62 md:aspect-100/31': props.isFullScreen,
      'col-span-2 aspect-100/62 md:col-span-1': !props.isFullScreen,
      'hover:cursor-not-allowed': props.isWIP,
      'hover:cursor-pointer': !props.isWIP,
    },
  )

  const backgroundImageClass = classNames('absolute w-full h-full', {
    'bg-[#313131]': props.slug === 'eye-protection-design-handbook',
    'bg-blue-500': props.slug === 'usability-design-for-xigua-video',
    'bg-red-600': props.slug === 'pachino',
    'bg-green-600': props.slug === 'bearychat',
    'bg-white': props.slug == null,
  })

  const textLayoutClass = classNames('absolute w-4/6 space-y-4', {
    'text-left md:text-center': props.isCenter,
    'text-left': !props.isCenter,
  })

  const textTitleClass = classNames('font-bold text-white', {
    'text-3xl xl:text-5xl 2xl:text-7xl': props.isCenter,
    'text-2xl xl:text-4xl 2xl:text-6xl': !props.isCenter,
  })

  // * Animation

  const backgroundImageControls = useAnimationControls()
  const backgroundMaskControls = useAnimationControls()
  const textControls = useAnimationControls()

  const backgroundMaskVariants = {
    initial: {
      opacity: 0,
    },
    hover: {
      opacity: 1,
    },
    transition: {
      ...primaryTransition,
    },
  }

  const backgroundImageVariants = {
    initial: {
      scale: 1.1,
    },
    hover: {
      scale: 1.2,
    },
    transition: {
      ...primaryTransition,
    },
  }

  const textVariants = {
    initial: {
      opacity: 0,
      y: -20,
    },
    hover: {
      opacity: 1,
      y: 0,
      transition: {
        ...primaryTransition,
      },
    },
  }

  // * Hooks
  const mouseContext = useMouseContext()

  const workCard = (
    <motion.div
      onHoverStart={() => {
        if (props.isWIP) {
          mouseContext.cursorChangeHandler('work-card-hovered-wip')
        } else {
          mouseContext.cursorChangeHandler('work-card-hovered')
        }
        backgroundImageControls.start(backgroundImageVariants.hover)
        backgroundMaskControls.start(backgroundMaskVariants.hover)
        textControls.start(textVariants.hover)
      }}
      onHoverEnd={() => {
        mouseContext.cursorChangeHandler('default')
        backgroundImageControls.start(backgroundImageVariants.initial)
        backgroundMaskControls.start(backgroundMaskVariants.initial)
        textControls.start(textVariants.initial)
      }}
      onClick={() => {
        if (!props.isWIP) {
          mouseContext.cursorChangeHandler('default')
        }
      }}
      className={linkClass}
    >
      <motion.div // Background Image
        animate={backgroundImageControls}
        initial="initial"
        variants={backgroundImageVariants}
        className={backgroundImageClass}
      >
        <Image
          src={props.cover}
          alt={'Cover for ' + props.title}
          fill
          className="object-cover"
        />
      </motion.div>
      <motion.div // Background Image Mask
        animate={backgroundMaskControls}
        initial="initial"
        variants={backgroundMaskVariants}
        className="absolute h-full w-full bg-black bg-opacity-50"
      />
      <motion.div // Text
        animate={textControls}
        initial="initial"
        variants={textVariants}
        className={textLayoutClass}
      >
        <div className="text-sm text-gray-300 xl:text-lg 2xl:text-2xl">
          {props.subTitle}
        </div>
        <div className={textTitleClass}>{props.title}</div>
      </motion.div>
    </motion.div>
  )

  // * Render
  if (props.isWIP) {
    return workCard
  } else {
    return (
      <Link href={`/works/${props.slug}`} passHref legacyBehavior>
        {workCard}
      </Link>
    )
  }
}

export default WorkCard
