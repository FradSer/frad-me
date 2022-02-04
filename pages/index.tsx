import Head from 'next/head';

import FLogo from '../components/f-logo';
import ThemeChanger from '../components/theme-changer';

import Triangle from '../components/triangle';
import DotCircle from '../components/dot-circle';
import Rectangle from '../components/rectangle';

export default function Home() {
  return (
    <div className="cursor-none bg-white dark:bg-black flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Frad LEE</title>
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/webclip.png" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </Head>

      <main className="flex flex-col w-full px-20 text-center">
        <nav className="flex w-full h-24 z-30">
          <div className="flex grow h-full items-center fill-black dark:fill-white">
            <a href="#" aria-current="page">
              <FLogo />
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
