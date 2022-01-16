import Head from 'next/head';
import Triangle from './components/triangle';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Frad LEE | a self-taught crafter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-full px-20 text-center">
        <nav className="flex w-full h-24">
          <div className="flex grow h-full items-center">
            <a href="#" aria-current="page">
              <img src="/logo.svg" alt="f. Logo" className="" />
            </a>
          </div>
          <div>
            <ul className="flex flex-row items-center h-full text-2xl space-x-8">
              <li>
                <a href="#" className="">
                  work
                </a>
              </li>
              <li>
                <a href="#" className="">
                  blog
                </a>
              </li>
              <li>
                <a href="#" className="">
                  side
                </a>
              </li>
              <li>
                <a href="#" className="flex justify-end">
                  resume
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <section className="w-full h-screen">
          <div className="flex h-full flex-row tems-center justify-center">
            <h1 className="flex flex-col items-start justify-center text-3xl xl:text-5xl 2xl:text-7xl font-bold">
              <div className="relative">
                <div className="absolute bottom-24 -left-24 ">
                  <Triangle />
                </div>
                Frad LEE
                <span className="text-gray-500"> is a self-taught crafter</span>
              </div>
              <div className="w-full flex">
                <span className="text-gray-500">who eager to learn for</span>
                <div className="flex grow ml-2 lg:ml-8 bg-black"></div>
              </div>
              <span className="text-gray-500">
                advancement. Whether it&apos;s{' '}
              </span>
              <div>
                coding
                <span className="text-gray-500"> with a new language, </span>
              </div>
              <div>
                design
                <span className="text-gray-500">
                  {' '}
                  with any tools whatsoever
                </span>
              </div>
              <div className="relative">
                <span className="text-gray-500">or building a </span>
                startup
                <div className="absolute top-6 -right-24 h-24 w-24">
                  <svg viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="48" fill="black" />
                  </svg>
                </div>
              </div>
            </h1>
          </div>
        </section>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t">
        <a
          className="flex items-center justify-center"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className="h-4 ml-2" />
        </a>
      </footer>
    </div>
  );
}
