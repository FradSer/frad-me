'use client';

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
    <section className="layout-wrapper my-12 flex h-24 flex-col items-start justify-between text-xl md:flex-row md:items-center">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
        <h2 className="mb-2 md:mb-0">patents</h2>
        <div className="flex flex-wrap gap-1 text-gray-600 dark:text-gray-400">
          {patents.map((patent, index) => (
            <span key={patent.number}>
              <a
                href={patent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-all duration-200 hover:opacity-70"
              >
                {patent.number}
              </a>
              {index < patents.length - 1 && <span className="mx-1">/</span>}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}