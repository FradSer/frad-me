import Head from 'next/head';

import ThemeChanger from '../components/theme-changer';

import Triangle from '../components/triangle';
import DotCircle from '../components/dot-circle';
import Rectangle from '../components/rectangle';

export default function Home() {
  return (
    <div className="cursor-none bg-white dark:bg-black flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Frad LEE | a self-taught crafter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-full px-20 text-center">
        <nav className="flex w-full h-24 z-30">
          <div className="flex grow h-full items-center">
            <a href="#" aria-current="page">
              <svg
                viewBox="0 0 19 35"
                className="w-8 h-8 fill-black dark:fill-white"
              >
                <path d="M14.816 0.919998C10.112 0.919998 6.848 3.32 5.744 9.128L5.024 12.824H0.895999L0.319999 15.752H4.448L0.703999 35H4.16L7.952 15.752H12.848L13.376 12.824H8.528L9.248 9.08C9.968 5.432 12.032 4.232 14.576 4.232H15.008L15.68 0.919998H14.816ZM17.7652 35L18.7252 30.056H13.7812L12.8212 35H17.7652Z" />
              </svg>
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
              <li>
                <ThemeChanger />
              </li>
            </ul>
          </div>
        </nav>

        <section className="w-full h-screen">
          <div className="flex h-full flex-row tems-center justify-center">
            <h1 className="flex flex-col items-start justify-center text-3xl xl:text-5xl 2xl:text-7xl font-bold">
              <div className="relative">
                <div className="absolute bottom-24 -left-24 z-30">
                  <Triangle />
                </div>
                Frad LEE
                <span className="text-gray-500"> is a self-taught crafter</span>
              </div>
              <div className="w-full flex">
                <span className="text-gray-500">who eager to learn for</span>
                {/* <div className="flex grow ml-2 lg:ml-8 bg-black"></div> */}
                <Rectangle />
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
                <DotCircle />
              </div>
            </h1>
          </div>
        </section>
      </main>

      <footer className="flex items-center justify-center w-full h-24"></footer>
    </div>
  );
}
