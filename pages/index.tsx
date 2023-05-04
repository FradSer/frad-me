import Head from 'next/head'

import Footer from '@/components/Footer'
import Hero from '@/components/Landing/Hero'
import Work from '@/components/Landing/Work'

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
  )
}
