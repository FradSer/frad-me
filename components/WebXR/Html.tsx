import React, { useMemo, useRef, useState, useEffect } from 'react'

import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import html2canvas from 'html2canvas'
import { renderToString } from 'react-dom/server'
import * as THREE from 'three'

// Prevents html2canvas warnings

HTMLCanvasElement.prototype.getContext = (function (origFn: any) {
  return function (this: any, type: any, attribs: any) {
    attribs = attribs || {}
    attribs.preserveDrawingBuffer = true
    return origFn.call(this, type, attribs)
  }
})(HTMLCanvasElement.prototype.getContext)

let container: HTMLElement | null = document.querySelector('#htmlContainer')

if (!container) {
  const node = document.createElement('div')
  node.setAttribute('id', 'htmlContainer')
  node.style.position = 'fixed'
  node.style.opacity = '0'
  node.style.pointerEvents = 'none'
  document.body.appendChild(node)
  container = node
}

type IHtmlProps = {
  children: React.ReactNode
  width?: number
  height?: number
  color?: string
}

export default function Html({
  children,
  width,
  height,
  color = 'transparent',
}: IHtmlProps) {
  const { camera, size: viewSize, gl } = useThree()

  const sceneSize = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera
    const fov = (cam.fov * Math.PI) / 180 // convert vertical fov to radians
    const height = 2 * Math.tan(fov / 2) * 5 // visible height
    const width = height * (viewSize.width / viewSize.height)
    return { width, height }
  }, [camera, viewSize])

  const lastUrl = useRef() as React.MutableRefObject<string>

  const [image, setImage] = useState(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  )

  const node = useMemo(() => {
    const node = document.createElement('div')
    node.innerHTML = renderToString(children as any)
    return node
  }, [children])

  useEffect(() => {
    container!.appendChild(node)
    html2canvas(node, { backgroundColor: color }).then((canvas) => {
      if (container!.contains(node)) {
        container!.removeChild(node)
      }
      canvas.toBlob((blob) => {
        if (blob === null) return
        if (lastUrl.current !== null) {
          URL.revokeObjectURL(lastUrl.current)
          const url: string = URL.createObjectURL(blob)
          lastUrl.current = url
          setImage(url)
        }
      })
    })
    return () => {
      if (!container) return
      if (container.contains(node)) {
        container.removeChild(node)
      }
    }
  }, [node, viewSize, sceneSize, color])

  const texture = useTexture(image)

  const size = useMemo(() => {
    const imageAspectW = texture.image.height / texture.image.width
    const imageAspectH = texture.image.width / texture.image.height

    const cam = camera as THREE.PerspectiveCamera
    const fov = (cam.fov * Math.PI) / 180 // convert vertical fov to radians

    let h = 2 * Math.tan(fov / 2) * 5 // visible height
    let w = h * imageAspectH

    if (width !== undefined) {
      w = width?.valueOf()
    }
    if (height !== undefined) {
      h = height?.valueOf()
    }

    if (height === undefined) {
      h = width!.valueOf() * imageAspectW
    }
    if (width === undefined) {
      w = h * imageAspectH
    }
    return {
      width: w,
      height: h,
    }
  }, [texture, width, height, camera])

  useMemo(() => {
    texture.matrixAutoUpdate = false
    const aspect = size.width / size.height
    const imageAspect = texture.image.width / texture.image.height
    texture.anisotropy = gl.capabilities.getMaxAnisotropy()
    texture.minFilter = THREE.LinearFilter
    if (aspect < imageAspect) {
      texture.matrix.setUvTransform(0, 0, 1, imageAspect / aspect, 0, 0.5, 0.5)
    } else {
      texture.matrix.setUvTransform(0, 0, aspect / imageAspect, 1, 0, 0.5, 0.5)
    }
  }, [texture, size, gl])

  return (
    <mesh>
      <planeGeometry args={[size.width, size.height]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent />
    </mesh>
  )
}
