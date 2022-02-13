import Head from 'next/head';

import Header from '../components/Header';
import DotCircle from '../components/Landing/DotCircle';
import Rectangle from '../components/Landing/Rectangle';
import Triangle from '../components/Landing/Triangle';
import WorkCard from '../components/Landing/WorkCard';

import { postFilePaths, POSTS_PATH } from '../utils/mdxUtils';

export default function Home() {
  return (
    <>
      <Head>
        <title>Frad LEE</title>
      </Head>

      <main className="bg-white dark:bg-black flex flex-col w-full items-center justify-center min-h-screen py-2 text-center">
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
        <section className="w-screen grid gap-4 grid-cols-2">
          <WorkCard
            title="Eye Protection Design Handbook"
            subTitle="Design Research"
            link="eye-protection-design-handbook"
          />
          <WorkCard
            title="Usability Design for Xigua Video"
            subTitle="Design Research / Product Design"
            link="usability-design-for-xigua-video"
          />
          <WorkCard
            title="Pachino"
            subTitle="Product Design / Development"
            link="pachino"
            background="pachino"
            isFullScreen={true}
            isCenter={true}
          />
          <WorkCard
            title="Eye Protection Design Handbook"
            subTitle="Design Research"
            link="eye-protection-design-handbook"
          />
          <WorkCard
            title="BearyChat"
            subTitle="Product Management / Strategy"
            link="bearychat"
            isCenter={true}
          />
        </section>
      </main>

      <footer className="flex items-center justify-center w-full h-24"></footer>
    </>
  );
}
