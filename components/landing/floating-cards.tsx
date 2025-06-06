'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Star, Users, Trophy, Zap } from 'lucide-react'

const floatingCards = [
  {
    id: 1,
    icon: Star,
    rating: 4.8,
    reviews: 127,
    title: "Elite Player Match",
    location: "Hyde Park, London",
    price: "Free",
    image: "bg-gradient-to-br from-green-400 via-blue-500 to-purple-600",
    delay: 0
  },
  {
    id: 2,
    icon: Users,
    rating: 4.9,
    reviews: 89,
    title: "Weekend Warriors",
    location: "Central Park, NYC",
    price: "Free",
    image: "bg-gradient-to-br from-orange-400 via-red-500 to-pink-600",
    delay: 0.2
  },
  {
    id: 3,
    icon: Trophy,
    rating: 5.0,
    reviews: 203,
    title: "Championship League",
    location: "Regent's Park, London",
    price: "Free",
    image: "bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600",
    delay: 0.4
  }
]

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

const cardVariants = {
  hidden: { opacity: 0, y: 100, rotateX: -15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: { 
      duration: 0.8, 
      ease: "easeOut",
      type: "spring",
      stiffness: 100
    }
  }
}

export function FloatingCards() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900 relative overflow-hidden" ref={ref}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
            Join Live Sessions
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Discover football sessions happening near you and connect with players of your skill level
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000"
        >
          {floatingCards.map((card) => (
            <motion.div
              key={card.id}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                z: 50,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="group cursor-pointer"
              style={{ 
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              <div className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 hover:shadow-green-500/20 transition-all duration-500">
                {/* Card Image */}
                <div className={`h-48 ${card.image} relative`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <motion.div 
                    className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-full p-2"
                    whileHover={{ scale: 1.1, rotate: 15 }}
                  >
                    <card.icon className="w-5 h-5 text-white" />
                  </motion.div>
                  
                  {/* Rating Badge */}
                  <motion.div 
                    className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm border border-gray-700/50 rounded-full px-3 py-1 flex items-center space-x-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: card.delay + 0.5, duration: 0.6 }}
                  >
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-semibold">{card.rating}</span>
                    <span className="text-gray-300 text-xs">({card.reviews})</span>
                  </motion.div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <motion.h3 
                    className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: card.delay + 0.7, duration: 0.6 }}
                  >
                    {card.title}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-gray-400 text-sm mb-4"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: card.delay + 0.8, duration: 0.6 }}
                  >
                    {card.location}
                  </motion.p>
                  
                  <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: card.delay + 0.9, duration: 0.6 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">{card.reviews} players</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white">{card.price}</span>
                      <p className="text-gray-400 text-xs">per session</p>
                    </div>
                  </motion.div>
                </div>

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating Action */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.button
            className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-green-500/25 border border-gray-700/50 backdrop-blur-sm"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)",
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center space-x-2">
              <span>Explore All Sessions</span>
              <Zap className="w-5 h-5" />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
} 