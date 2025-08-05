import React from 'react'

import { motion } from 'framer-motion'

const WebXR2DFallback = () => {
  const staggerContainer = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.8, staggerChildren: 0.1 }
    }
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  const float = {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  const decorativeShapes = [
    { className: "h-16 w-16 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500", delay: 0 },
    { className: "h-20 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500", delay: 1 },
    { className: "h-14 w-14 rotate-45 bg-gradient-to-br from-pink-400 to-red-500", delay: 2 }
  ]

  const descriptions = [
    "is a self-taught craftier",
    "who is eager to learn for advancement.",
    "Whether it is coding in a new language,",
    "design with any tool whatsoever",
    "or building a startup."
  ]

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <motion.div
        className="max-w-4xl px-8 text-center text-white"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div className="mb-8 flex justify-center space-x-6" variants={fadeInUp}>
          {decorativeShapes.map((shape, index) => (
            <motion.div
              key={index}
              className={shape.className}
              animate={float}
              style={{ animationDelay: `${shape.delay}s` }}
            />
          ))}
        </motion.div>

        <motion.h1
          className="mb-6 text-6xl font-black leading-tight md:text-7xl"
          variants={fadeInUp}
        >
          Frad LEE
        </motion.h1>

        {descriptions.map((text, index) => (
          <motion.p
            key={index}
            className="mb-4 text-xl text-gray-300 md:text-2xl"
            variants={fadeInUp}
          >
            {text}
          </motion.p>
        ))}

        <motion.div className="space-y-4" variants={fadeInUp}>
          <p className="text-sm text-gray-400">
            This is a 2D version of the WebXR experience
          </p>
          <div className="flex flex-col items-center space-y-3 md:flex-row md:justify-center md:space-x-4 md:space-y-0">
            <button
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Try WebXR Again
            </button>
            <button
              className="rounded-lg bg-gray-700 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-600"
              onClick={() => (window.location.href = '/')}
            >
              Explore Portfolio
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default WebXR2DFallback