import Head from 'next/head';

import Hero from '../components/Landing/Hero';
import Work from '../components/Landing/Work';

export default function Home() {
  return (
    <>
      <Head>
        <title>Frad LEE</title>
      </Head>

      <main className="bg-white dark:bg-black flex flex-col w-full items-center justify-center min-h-screen py-2 text-center">
        <Hero />
        <Work />
      </main>

      <footer className="flex items-center justify-center w-full h-24"></footer>
    </>
  );
}
