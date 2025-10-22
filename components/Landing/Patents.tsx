'use client';

import { CursorProvider, CursorType } from '@/components/common/CursorProvider';

const patents = [
  {
    number: 'CN118939106A',
    url: 'https://patents.google.com/patent/CN118939106A',
  },
  {
    number: 'CN118939105A',
    url: 'https://patents.google.com/patent/CN118939105A',
  },
  {
    number: 'WO2023143051A1',
    url: 'https://patents.google.com/patent/WO2023143051A1',
  },
  {
    number: 'CN118535001A',
    url: 'https://patents.google.com/patent/CN118535001A',
  },
  {
    number: 'CN113504832A',
    url: 'https://patents.google.com/patent/CN113504832A',
  },
  {
    number: 'CN117635879A',
    url: 'https://patents.google.com/patent/CN117635879A',
  },
  {
    number: 'CN117376625A',
    url: 'https://patents.google.com/patent/CN117376625A',
  },
  {
    number: 'CN117676261A',
    url: 'https://patents.google.com/patent/CN117676261A',
  },
];

export default function Patents() {
  return (
    <section className="layout-wrapper my-20 md:my-24 lg:my-32">
      <div className="flex flex-col items-start">
        <h2 className="mb-8 text-[7rem] hover:cursor-default lg:text-[10rem] xl:text-[13rem] 2xl:text-[16rem]">
          patent
        </h2>
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
