import React, { useRef, useState } from 'react'

import { Text } from '@react-three/drei'
import { useFrame, extend } from '@react-three/fiber'
import { XRButton } from '@react-three/xr'

extend({ XRButton })

interface ILineProps {
  position: [number, number, number]
  color: string
  text: string
}

interface IShapeProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

function Line(props: Readonly<ILineProps>) {
  return (
    <Text
      color={props.color}
      anchorX="center"
      anchorY="middle"
      fontSize={1}
      position={props.position}
      rotation={[0, 0, 0]}
      font="fonts/GT-Eesti-Display-Bold-Trial.woff"
      onClick={() => console.log('clicked')}
    >
      {props.text}
    </Text>
  )
}

function Box(props: Readonly<IShapeProps>) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)
  useFrame((state, delta) => {
    // @ts-ignore
    meshRef.current.rotation.x += delta / 10
  })
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      // @ts-ignore
      ref={meshRef}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHovered(true)}
      onPointerOut={(event) => setHovered(false)}
    >
      <boxGeometry args={[3, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'gray' : 'white'} />
    </mesh>
  )
}

function Triangle(props: Readonly<IShapeProps>) {
  const meshRef = useRef()

  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)

  useFrame((state, delta) => {
    // @ts-ignore
    meshRef.current.rotation.z += delta / 10
  })

  return (
    <mesh
      {...props}
      // @ts-ignore
      ref={meshRef}
      scale={1.5}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHovered(true)}
      onPointerOut={(event) => setHovered(false)}
    >
      <coneGeometry args={[1, 1.4, 3, 1]} />
      <meshStandardMaterial color={hovered ? 'gray' : 'white'} />
    </mesh>
  )
}

function Sphere(props: Readonly<IShapeProps>) {
  const meshRef = useRef()

  const [hovered, setHovered] = useState(false)

  useFrame((state, delta) => {
    // @ts-ignore
    meshRef.current.rotation.y += delta / 5
  })

  return (
    <mesh
      {...props}
      // @ts-ignore
      ref={meshRef}
      scale={1.5}
      onPointerOver={(event) => setHovered(true)}
      onPointerOut={(event) => setHovered(false)}
    >
      <sphereGeometry args={[0.65, 16, 16]} />
      <meshStandardMaterial color={hovered ? 'gray' : 'white'} />
    </mesh>
  )
}

function HeroText() {
  return (
    <>
      <ambientLight intensity={Math.PI / 10} />

      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Triangle position={[-9, 4, 0]} rotation={[0.1, 0.2, 0.1]} scale={0.5} />
      <Line position={[-5.3, 3, 0]} color={'white'} text={'Frad LEE'} />
      <Line
        position={[2, 3, 0]}
        color={'gray'}
        text={'is a self-taught craftier'}
      />
      <Line
        position={[-1.8, 1.8, 0]}
        color={'gray'}
        text={'who is eager to learn for'}
      />
      <Box position={[5.7, 1.8, 0]} />
      <Line
        position={[-1, 0.6, 0]}
        color={'gray'}
        text={'advancement. Whether it is'}
      />
      <Line
        position={[-1.3, -0.6, 0]}
        color={'gray'}
        text={'coding in a new language,'}
      />
      <Line
        position={[0.1, -1.8, 0]}
        color={'gray'}
        text={'design with any tool whatsoever'}
      />
      <Line
        position={[-2.5, -3, 0]}
        color={'gray'}
        text={'or building a startup'}
      />
      <Sphere position={[3.2, -4, 0]} />
    </>
  )
}

export default HeroText
