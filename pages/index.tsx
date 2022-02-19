import Head from 'next/head';

import Hero from '../components/Landing/Hero';
import WorkCard from '../components/Landing/WorkCard';

import workLinks from '../content/workLinks';

export default function Home() {
  return (
    <>
      <Head>
        <title>Frad LEE</title>
      </Head>

      <main className="bg-white dark:bg-black flex flex-col w-full items-center justify-center min-h-screen py-2 text-center">
        <Hero />
        <section className="w-screen grid gap-4 grid-cols-2">
          {workLinks.map((link) => (
            <WorkCard
              key={link.title}
              title={link.title}
              subTitle={link.subTitle}
              slug={link.slug}
              background={link.background}
              isFullScreen={link.isFullScreen}
              isCenter={link.isCenter}
            />
          ))}
        </section>
      </main>

      <footer className="flex items-center justify-center w-full h-24"></footer>
    </>
  );
}
