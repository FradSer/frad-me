import React from 'react'
import { OrbitControls, Html } from '@react-three/drei'

const COMMON_FONT_STYLE = 'Arial, sans-serif'
const TEXT_COLOR_GRAY = '#9ca3af'
const TEXT_COLOR_WHITE = 'white'

const SafeScene: React.FC = () => {
  return (
    <>
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        maxDistance={15}
        minDistance={5}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />

      {/* Basic lighting without shadows */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />

      {/* Safe 3D content matching Hero component */}
      <group position={[0, 0, -10]}>
        {/* Main title */}
        <Html position={[0, 4, 0]} center>
          <div style={{
            color: TEXT_COLOR_WHITE,
            fontSize: '48px',
            fontWeight: 'bold',
            textAlign: 'center',
            fontFamily: COMMON_FONT_STYLE
          }}>
            Frad LEE
          </div>
        </Html>

        {/* Subtitle lines */}
        <Html position={[0, 2.5, 0]} center>
          <div style={{
            color: TEXT_COLOR_GRAY,
            fontSize: '24px',
            textAlign: 'center',
            fontFamily: COMMON_FONT_STYLE
          }}>
            is a self-taught craftier
          </div>
        </Html>

        <Html position={[0, 1.5, 0]} center>
          <div style={{
            color: TEXT_COLOR_GRAY,
            fontSize: '24px',
            textAlign: 'center',
            fontFamily: COMMON_FONT_STYLE
          }}>
            who is eager to learn for
          </div>
        </Html>

        <Html position={[0, 0.5, 0]} center>
          <div style={{
            color: TEXT_COLOR_GRAY,
            fontSize: '24px',
            textAlign: 'center',
            fontFamily: COMMON_FONT_STYLE
          }}>
            advancement. Whether it&apos;s
          </div>
        </Html>

        <Html position={[0, -0.5, 0]} center>
          <div style={{
            color: TEXT_COLOR_WHITE,
            fontSize: '24px',
            textAlign: 'center',
            fontFamily: COMMON_FONT_STYLE,
            fontWeight: 'bold'
          }}>
            coding <span style={{ color: TEXT_COLOR_GRAY, fontWeight: 'normal' }}>in a new language,</span>
          </div>
        </Html>

        <Html position={[0, -1.5, 0]} center>
          <div style={{
            color: TEXT_COLOR_WHITE,
            fontSize: '24px',
            textAlign: 'center',
            fontFamily: COMMON_FONT_STYLE,
            fontWeight: 'bold'
          }}>
            design <span style={{ color: TEXT_COLOR_GRAY, fontWeight: 'normal' }}>with any tool whatsoever</span>
          </div>
        </Html>

        <Html position={[0, -2.5, 0]} center>
          <div style={{
            color: TEXT_COLOR_GRAY,
            fontSize: '24px',
            textAlign: 'center',
            fontFamily: COMMON_FONT_STYLE
          }}>
            or building a <span style={{ color: TEXT_COLOR_WHITE, fontWeight: 'bold' }}>startup</span>
          </div>
        </Html>
      </group>

      {/* Simple geometric shapes using basic materials */}
      <group position={[0, 0, 0]}>
        {/* Triangle - simplified cone */}
        <mesh position={[-6, 4, -2]} rotation={[0, 0, 0]}>
          <coneGeometry args={[1, 1.8, 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Rectangle - simple box */}
        <mesh position={[4, 1.5, -1]} rotation={[0, 0, 0]}>
          <boxGeometry args={[2, 0.2, 0.5]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Circle - simple sphere */}
        <mesh position={[3, -2.5, -1]} rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Interactive button */}
      <Html position={[0, -6, 0]} center>
        <div style={{ textAlign: 'center' }}>
          <button
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: COMMON_FONT_STYLE
            }}
            onClick={() => {
              if (typeof window !== 'undefined') {
                const homeUrl = new URL('/', window.location.origin)
                window.location.href = homeUrl.toString()
              }
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#1d4ed8'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6'
            }}
          >
            Explore My Work
          </button>
          <div style={{
            marginTop: '16px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: COMMON_FONT_STYLE
          }}>
            Safe 3D Mode - No WebXR Polyfill Conflicts
          </div>
        </div>
      </Html>
    </>
  )
}

export default SafeScene