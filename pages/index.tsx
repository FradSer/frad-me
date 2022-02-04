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
          <div className="flex grow h-full items-center">
            <a href="#" aria-current="page">
              <svg
                viewBox="0 0 1024 1024"
                className="w-12 h-12 fill-black dark:fill-white"
              >
                <path d="M359.274 448.928a19.96 19.96 0 0 0-18.75 13.118l-19.117 52.395c-4.751 13.021 4.89 26.802 18.75 26.802h233.461a19.959 19.959 0 0 0 18.751-13.119l19.117-52.395c4.751-13.021-4.89-26.801-18.751-26.801H359.274ZM618.032 767.902a19.96 19.96 0 0 0-18.751 13.118l-19.117 52.395c-4.751 13.021 4.89 26.802 18.751 26.802h49.821a19.961 19.961 0 0 0 18.751-13.119l19.117-52.395c4.751-13.021-4.89-26.801-18.751-26.801h-49.821Z" />
                <path d="M370.751 860.217a9.98 9.98 0 0 0 9.381-6.574l128.136-353.896 23.087-65.729 32.451-87.735a342.268 342.268 0 0 1 16.549-37.674c6.224-12.118 13.705-22.442 22.442-30.971 8.736-8.529 18.8-14.778 30.192-18.748 11.392-3.97 24.407-4.665 39.046-2.083 7.93 1.398 14.989 3.272 21.178 5.622 2.395.909 5.625 2.296 8.684 3.653 5.111 2.269 11.137.035 13.413-5.073l22.806-51.155c2.319-5.203-.177-11.27-5.541-13.189-10.76-3.849-28.231-9.682-41.221-11.972-28.668-5.055-54.259-4.376-76.773 2.039-22.515 6.414-42.392 16.597-59.632 30.549-17.24 13.952-31.86 30.884-43.862 50.794a384.195 384.195 0 0 0-30.379 62.612l-32.612 88.65-23.087 65.73-130.977 361.764c-2.362 6.508 2.458 13.386 9.381 13.386h67.338Z" />
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
