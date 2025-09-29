import Footer from '@/components/Footer';
import Hero from '@/components/Landing/Hero';
import Patents from '@/components/Landing/Patents';
import Work from '@/components/Landing/Work';

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Work />
      </main>

      <Patents />
      <Footer />
    </>
  );
}
