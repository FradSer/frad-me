import Head from 'next/head';

import Hero from '../components/Landing/Hero';
import WorkCard from '../components/Landing/WorkCard';

export default function Home() {
  return (
    <>
      <Head>
        <title>Frad LEE</title>
      </Head>

      <main className="bg-white dark:bg-black flex flex-col w-full items-center justify-center min-h-screen py-2 text-center">
        <section className="w-full h-screen">
          <Hero />
        </section>
        <section className="w-screen grid gap-4 grid-cols-2">
          <WorkCard
            title="Eye Protection Design Handbook"
            subTitle="Design Research"
            slug="eye-protection-design-handbook"
          />
          <WorkCard
            title="Usability Design for Xigua Video"
            subTitle="Design Research / Product Design"
            slug="usability-design-for-xigua-video"
          />
          <WorkCard
            title="Pachino"
            subTitle="Product Design / Development"
            slug="pachino"
            background="pachino"
            isFullScreen={true}
            isCenter={true}
          />
          <WorkCard
            title="Eye Protection Design Handbook"
            subTitle="Design Research"
            slug="eye-protection-design-handbook"
          />
          <WorkCard
            title="BearyChat"
            subTitle="Product Management / Strategy"
            slug="bearychat"
            isCenter={true}
          />
        </section>
      </main>

      <footer className="flex items-center justify-center w-full h-24"></footer>
    </>
  );
}
