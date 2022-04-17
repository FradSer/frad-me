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

      <main>
        <Hero />
        <Work />
      </main>

      <Footer />
    </>
  );
}
