import dynamic from 'next/dynamic'

const WebXRPageClient = dynamic(
  () => import('@/components/WebXR/WebXRPageClient'),
  { ssr: false }
)

export default function WebXR() {
  return <WebXRPageClient />
}
