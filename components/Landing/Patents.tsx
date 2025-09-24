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
    <section className="layout-wrapper my-12 text-xl">
      <div className="flex flex-col items-start">
        <h2 className="mb-4">patents</h2>
        <ul className="flex flex-wrap gap-1 text-gray-600 dark:text-gray-400">
          {patents.map((patent, index) => (
            <li key={patent.number} className="flex items-center">
              <a
                href={patent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-all duration-200 hover:opacity-70"
              >
                {patent.number}
              </a>
              {index < patents.length - 1 && <span className="mx-1">/</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}