'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const steps = [
  {
    number: 1,
    title: "Join Sessions",
    description: "Scan QR codes at football sessions or create your own to start playing with the community",
    gradient: "from-green-500 to-green-600"
  },
  {
    number: 2,
    title: "Play & Connect",
    description: "Enjoy the game with fellow players while building authentic connections on and off the pitch",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    number: 3,
    title: "Rate & Build Rep",
    description: "Give and receive ratings to build your digital football reputation and unlock new opportunities",
    gradient: "from-purple-500 to-purple-600"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
}

const stepVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.7, 
      ease: "easeOut",
      type: "spring",
      stiffness: 100
    }
  }
}

export function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900 border-t border-gray-800/50 relative overflow-hidden" ref={ref}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Three simple steps to start building your football reputation
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              variants={stepVariants}
              className="text-center relative"
            >
              <motion.div 
                className={`w-20 h-20 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg shadow-black/20 border border-gray-700/30`}
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  boxShadow: "0 15px 35px rgba(0,0,0,0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 10 
                }}
              >
                {step.number}
              </motion.div>
              
              <motion.h3 
                className="text-xl font-semibold text-white mb-4"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
              >
                {step.title}
              </motion.h3>
              
              <motion.p 
                className="text-gray-400 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
              >
                {step.description}
              </motion.p>
              
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <motion.div 
                  className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-gray-600/50 to-gray-500/50 -z-10"
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ delay: 0.8 + index * 0.2, duration: 0.8 }}
                  style={{ transformOrigin: "left" }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
} 