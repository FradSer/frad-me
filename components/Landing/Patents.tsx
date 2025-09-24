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
    <section className="layout-wrapper my-12 flex flex-col">
      <h2 className="text-xl mb-4">
        patents
      </h2>
      <div className="flex flex-wrap gap-1 text-xl text-gray-600 dark:text-gray-400">
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
    </section>
  );
}