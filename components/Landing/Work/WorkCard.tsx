'use client';

import { clsx } from 'clsx';
import { motion, type useAnimationControls } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { forwardRef, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import useMouseContext from '@/hooks/useMouseContext';
import {
  type AnimationVariants,
  createVariants,
  useAnimationGroup,
} from '@/utils/motion/animationHelpers';

type AnimationControls = ReturnType<typeof useAnimationControls>;

import { getWorkColor } from '@/utils/theme/workColors';

interface IWorkCardProps {
  title: string;
  subTitle: string;
  slug: string;
  cover: string;
  isFullScreen?: boolean;
  isCenter?: boolean;
  isWIP?: boolean;
  externalLink?: string;
}

interface IWorkCardContentProps {
  title: string;
  subTitle: string;
  cover: string;
  slug: string;
  isFullScreen?: boolean;
  isCenter?: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
  controls: Record<string, AnimationControls>;
  variants: AnimationVariants;
}

const WorkCardContent = memo(
  forwardRef<HTMLDivElement, IWorkCardContentProps>((props, ref) => {
    const backgroundImageClass = useMemo(
      () => clsx('absolute w-full h-full', getWorkColor(props.slug)),
      [props.slug],
    );

    const textLayoutClass = useMemo(
      () =>
        clsx('absolute w-4/6 space-y-4', {
          'text-center': props.isCenter,
          'text-left': !props.isCenter,
        }),
      [props.isCenter],
    );

    const textTitleClass = useMemo(
      () =>
        clsx('font-bold text-white', {
          'text-3xl xl:text-5xl 2xl:text-7xl': props.isCenter,
          'text-2xl xl:text-4xl 2xl:text-6xl': !props.isCenter,
        }),
      [props.isCenter],
    );

    return (
      <motion.div
        ref={ref}
        onHoverStart={props.onHoverStart}
        onHoverEnd={props.onHoverEnd}
        onClick={props.onClick}
        className="relative flex w-full h-full items-center justify-center overflow-hidden"
      >
        <div className={backgroundImageClass}>
          <motion.div
            animate={props.controls.backgroundImage}
            initial="initial"
            variants={props.variants.backgroundImage}
            className="absolute w-full h-full will-change-transform"
          >
            <Image
              src={props.cover}
              alt={`Cover for ${props.title}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </div>
        <motion.div
          animate={props.controls.backgroundMask}
          initial="initial"
          variants={props.variants.backgroundMask}
          className="absolute h-full w-full bg-black"
        />
        <motion.div
          animate={props.controls.text}
          initial="initial"
          variants={props.variants.text}
          className={textLayoutClass}
        >
          <div className="text-sm text-gray-300 xl:text-lg 2xl:text-2xl">{props.subTitle}</div>
          <div className={textTitleClass}>{props.title}</div>
        </motion.div>
      </motion.div>
    );
  }),
);

WorkCardContent.displayName = 'WorkCardContent';

const ANIMATION_KEYS = ['backgroundImage', 'backgroundMask', 'text'];
const HOVER_DEBOUNCE_MS = 50; // hover 状态切换的防抖阈值

function WorkCard(props: Readonly<IWorkCardProps>) {
  // * Styling
  const linkClass = useMemo(
    () =>
      clsx('relative flex w-full items-center justify-center overflow-hidden', {
        'col-span-2 aspect-100/62 md:col-span-2 md:aspect-100/31': props.isFullScreen,
        'col-span-2 aspect-100/62 md:col-span-1': !props.isFullScreen,
        'hover:cursor-not-allowed': props.isWIP,
        'hover:cursor-pointer': !props.isWIP,
      }),
    [props.isFullScreen, props.isWIP],
  );

  // * Animation
  const { controls, startGroup } = useAnimationGroup(ANIMATION_KEYS);

  const variants = useMemo(
    () =>
      createVariants({
        backgroundMask: {
          initial: { opacity: 0 },
          hover: { opacity: 0.5 },
        },
        backgroundImage: {
          initial: { scale: 1.1 },
          hover: { scale: 1.2 },
        },
        text: {
          initial: { opacity: 0, y: -20 },
          hover: { opacity: 1, y: 0 },
        },
      }),
    [],
  );

  // * Hooks
  const { cursorChangeHandler } = useMouseContext();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveredRef = useRef(false);

  // * Animation handlers
  const handleHoverStart = useCallback(() => {
    // 清除可能存在的 hoverEnd 定时器
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // 防止在防抖期内重复触发
    if (isHoveredRef.current) return;

    isHoveredRef.current = true;

    const cursorType = props.isWIP ? 'work-card-hovered-wip' : 'work-card-hovered';
    cursorChangeHandler(cursorType);

    startGroup({
      backgroundImage: 'hover',
      backgroundMask: 'hover',
      text: 'hover',
    });
  }, [props.isWIP, cursorChangeHandler, startGroup]);

  const handleHoverEnd = useCallback(() => {
    // 使用防抖延迟执行 hoverEnd
    hoverTimeoutRef.current = setTimeout(() => {
      isHoveredRef.current = false;

      cursorChangeHandler('default');

      startGroup({
        backgroundImage: 'initial',
        backgroundMask: 'initial',
        text: 'initial',
      });
    }, HOVER_DEBOUNCE_MS);
  }, [cursorChangeHandler, startGroup]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = useCallback(() => {
    if (!props.isWIP) {
      cursorChangeHandler('default');
    }
  }, [props.isWIP, cursorChangeHandler]);

  // * Create shared content
  const workCardContent = (
    <WorkCardContent
      title={props.title}
      subTitle={props.subTitle}
      cover={props.cover}
      slug={props.slug}
      isFullScreen={props.isFullScreen}
      isCenter={props.isCenter}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={handleClick}
      controls={controls}
      variants={variants}
    />
  );

  // * Render with appropriate wrapper
  if (props.isWIP) {
    return <div className={linkClass}>{workCardContent}</div>;
  }

  if (props.externalLink) {
    return (
      <a href={props.externalLink} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {workCardContent}
      </a>
    );
  }

  return (
    <Link href={`/works/${props.slug}`} className={linkClass}>
      {workCardContent}
    </Link>
  );
}

export default memo(WorkCard);
