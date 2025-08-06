import Image from 'next/image'
import Link from 'next/link'

import classNames from 'classnames'
import { motion } from 'framer-motion'

import useMouseContext from '@/hooks/useMouseContext'

import { createVariants, useAnimationGroup } from '@/utils/motion/animationHelpers'
import { getWorkColor } from '@/utils/theme/workColors'

interface IWorkCardProps {
  title: string
  subTitle: string
  slug: string
  cover: string
  isFullScreen?: boolean
  isCenter?: boolean
  isWIP?: boolean
}

function WorkCard(props: Readonly<IWorkCardProps>) {
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

  const backgroundImageClass = classNames(
    'absolute w-full h-full',
    getWorkColor(props.slug)
  )

  const textLayoutClass = classNames('absolute w-4/6 space-y-4', {
    'text-left md:text-center': props.isCenter,
    'text-left': !props.isCenter,
  })

  const textTitleClass = classNames('font-bold text-white', {
    'text-3xl xl:text-5xl 2xl:text-7xl': props.isCenter,
    'text-2xl xl:text-4xl 2xl:text-6xl': !props.isCenter,
  })

  // * Animation
  const { controls, startGroup } = useAnimationGroup(['backgroundImage', 'backgroundMask', 'text'])
  
  const variants = createVariants({
    backgroundMask: {
      initial: { opacity: 0 },
      hover: { opacity: 1 },
    },
    backgroundImage: {
      initial: { scale: 1.1 },
      hover: { scale: 1.2 },
    },
    text: {
      initial: { opacity: 0, y: -20 },
      hover: { opacity: 1, y: 0 },
    },
  })

  // * Hooks
  const mouseContext = useMouseContext()

  // * Animation handlers
  const handleHoverStart = () => {
    const cursorType = props.isWIP ? 'work-card-hovered-wip' : 'work-card-hovered'
    mouseContext.cursorChangeHandler(cursorType)
    
    startGroup({
      backgroundImage: 'hover',
      backgroundMask: 'hover',
      text: 'hover',
    })
  }

  const handleHoverEnd = () => {
    mouseContext.cursorChangeHandler('default')
    
    startGroup({
      backgroundImage: 'initial',
      backgroundMask: 'initial',
      text: 'initial',
    })
  }

  const handleClick = () => {
    if (!props.isWIP) {
      mouseContext.cursorChangeHandler('default')
    }
  }

  const workCard = (
    <motion.div
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={handleClick}
      className={linkClass}
    >
      <motion.div // Background Image
        animate={controls.backgroundImage}
        initial="initial"
        variants={variants.backgroundImage}
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
        animate={controls.backgroundMask}
        initial="initial"
        variants={variants.backgroundMask}
        className="absolute h-full w-full bg-black bg-opacity-50"
      />
      <motion.div // Text
        animate={controls.text}
        initial="initial"
        variants={variants.text}
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
