import Head from 'next/head';

import Hero from '../components/Landing/Hero';
import Work from '../components/Landing/Work';
import Header from '../components/Header';

export default function Home() {
  return (
    <>
      <Head>
        <title>Frad LEE</title>
      </Head>

      <main className="bg-white dark:bg-black flex flex-col w-full min-h-screen items-center justify-center py-2 text-center">
        <div className="min-h-screen w-full flex flex-col">
          <Header />
          <Hero />
        </div>
        <Work />
      </main>

      <footer className="flex items-center justify-center w-full h-24"></footer>
    </>
  );
}
