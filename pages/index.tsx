import Head from 'next/head';

import Header from '../components/Header';
import Hero from '../components/Landing/Hero';
import Work from '../components/Landing/Work';

export default function Home() {
  return (
    <>
      <Head>
        <title>Frad LEE</title>
      </Head>

      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white py-2 text-center dark:bg-black">
        <div className="flex min-h-screen w-full flex-col">
          <Header />
          <Hero />
        </div>
        <Work />
      </main>

      <footer className="flex h-24 w-full items-center justify-center"></footer>
    </>
  );
}
