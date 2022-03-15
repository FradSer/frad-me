import Head from 'next/head';

import Hero from '../components/Landing/Hero';
import Work from '../components/Landing/Work';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>Frad LEE</title>
      </Head>

      <main className="flex flex-col items-center justify-center bg-white dark:bg-black">
        <div className="flex min-h-screen w-screen">
          <Hero />
        </div>
        <Work />
      </main>
      <Footer />
    </>
  );
}
