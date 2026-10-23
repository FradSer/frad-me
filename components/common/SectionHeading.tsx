import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type SectionHeadingProps = {
  children: ReactNode;
  className?: string;
};

export default function SectionHeading({ children, className }: Readonly<SectionHeadingProps>) {
  return (
    <h2
      className={clsx(
        'text-[7rem] hover:cursor-default lg:text-[10rem] xl:text-[13rem] 2xl:text-[16rem]',
        className,
      )}
    >
      {children}
    </h2>
  );
}
