'use client';

import { CursorProvider, CursorType } from '@/components/common/CursorProvider';
import SectionHeading from '@/components/common/SectionHeading';
import patents from '@/content/patents';

export default function Patents() {
  return (
    <section id="patent" className="layout-wrapper my-20 scroll-mt-24 md:my-24 lg:my-32">
      <div className="flex flex-col items-start">
        <SectionHeading className="mb-8">patent</SectionHeading>
        <ul className="flex flex-wrap gap-1 text-black dark:text-white text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
          {patents.map((patent, index) => (
            <li key={patent.number} className="flex items-center">
              <CursorProvider targetCursorType={CursorType.headerLinkHovered}>
                <a
                  href={patent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:decoration-4 hover:delay-1000 hover:cursor-pointer transition-all duration-200"
                >
                  {patent.number}
                </a>
              </CursorProvider>
              {index < patents.length - 1 && <span className="mx-3">/</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
