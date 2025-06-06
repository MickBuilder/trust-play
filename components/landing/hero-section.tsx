'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

// Floating football objects data
const floatingObjects = [
  {
    id: 1,
    emoji: "⚽",
    size: "text-6xl",
    initialX: "10%",
    initialY: "20%",
    duration: 15,
    delay: 0
  },
  {
    id: 2,
    emoji: "🥅",
    size: "text-5xl",
    initialX: "85%",
    initialY: "30%",
    duration: 12,
    delay: 2
  },
  {
    id: 3,
    emoji: "👟",
    size: "text-4xl",
    initialX: "15%",
    initialY: "70%",
    duration: 18,
    delay: 1
  },
  {
    id: 4,
    emoji: "🏆",
    size: "text-5xl",
    initialX: "80%",
    initialY: "60%",
    duration: 14,
    delay: 3
  },
  {
    id: 5,
    emoji: "⚽",
    size: "text-4xl",
    initialX: "25%",
    initialY: "45%",
    duration: 16,
    delay: 4
  },
  {
    id: 6,
    emoji: "🎯",
    size: "text-4xl",
    initialX: "75%",
    initialY: "25%",
    duration: 13,
    delay: 1.5
  },
  {
    id: 7,
    emoji: "👕",
    size: "text-4xl",
    initialX: "5%",
    initialY: "50%",
    duration: 17,
    delay: 2.5
  },
  {
    id: 8,
    emoji: "🥅",
    size: "text-4xl",
    initialX: "90%",
    initialY: "40%",
    duration: 11,
    delay: 0.5
  }
]

export function HeroSection() {
  const [particles, setParticles] = useState<Array<{left: string, top: string}>>([])

  useEffect(() => {
    // Generate random positions only on client side to avoid hydration mismatch
    const newParticles = Array.from({ length: 12 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black min-h-[80vh] flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl"></div>
      
      {/* Animated Floating Football Objects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingObjects.map((obj) => (
          <motion.div
            key={obj.id}
            className={`absolute ${obj.size} opacity-10 sm:opacity-30 md:opacity-60 hover:opacity-90 transition-opacity duration-300 ${obj.id > 4 ? 'hidden sm:block' : ''}`}
            style={{
              left: obj.initialX,
              top: obj.initialY,
            }}
            animate={{
              y: [0, -30, 0, -20, 0],
              x: [0, 10, 0, -10, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1, 0.9, 1],
            }}
            transition={{
              duration: obj.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: obj.delay,
            }}
            whileHover={{
              scale: 1.5,
              opacity: 0.9,
              transition: { duration: 0.3 }
            }}
          >
            <motion.span
              animate={{
                filter: [
                  "drop-shadow(0 0 5px rgba(34, 197, 94, 0.3))",
                  "drop-shadow(0 0 15px rgba(59, 130, 246, 0.5))",
                  "drop-shadow(0 0 5px rgba(168, 85, 247, 0.3))",
                  "drop-shadow(0 0 15px rgba(34, 197, 94, 0.5))",
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: obj.delay
              }}
            >
              {obj.emoji}
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* Additional Floating Particles - Client Side Only */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-r from-green-400/30 to-blue-400/30 rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div variants={itemVariants}>
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-gray-800/50 border border-gray-700/50 text-gray-300 backdrop-blur-sm">
              🏆 The Future of Football Community
            </Badge>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="text-white">Build Your</span>{' '}
            <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
              Digital Football
            </span>{' '}
            <span className="text-white">Reputation</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            TrustPlay revolutionizes recreational football by creating a community-driven rating platform. 
            Get rated by teammates and opponents after each match to build your digital football footprint.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/login">
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button size="lg" className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 hover:from-green-600 hover:via-blue-600 hover:to-purple-700 px-8 py-4 text-lg text-white border border-gray-700/50 shadow-lg shadow-green-500/25">
                  Start Building Your Rep
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
            
            <motion.div
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg bg-gray-900/50 border-gray-700/50 text-white hover:bg-gray-800/50 backdrop-blur-sm">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating Stats */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
          >
            {[
              { number: "10K+", label: "Active Players" },
              { number: "500+", label: "Sessions Daily" },
              { number: "4.9", label: "Average Rating" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6 bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl"
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(17, 24, 39, 0.5)"
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
} 