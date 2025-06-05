'use client'

import { Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const linkVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-gray-800/50 text-gray-400 py-12" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col md:flex-row justify-between items-center"
        >
          <motion.div 
            variants={linkVariants}
            className="flex items-center space-x-2 mb-4 md:mb-0"
          >
            <motion.div 
              className="w-8 h-8 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25"
              whileHover={{ 
                rotate: 15,
                scale: 1.1,
                boxShadow: "0 8px 25px rgba(34, 197, 94, 0.4)"
              }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Trophy className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              TrustPlay
            </span>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            className="flex space-x-6 text-sm"
          >
            {[
              { href: "/privacy", text: "Privacy" },
              { href: "/terms", text: "Terms" },
              { href: "/contact", text: "Contact" }
            ].map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                variants={linkVariants}
                whileHover={{ 
                  color: "#ffffff",
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                className="hover:text-white transition-colors cursor-pointer border-b border-transparent hover:border-gray-600"
              >
                {link.text}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 pt-8 border-t border-gray-800/50 text-center text-sm text-gray-500"
        >
          © {currentYear} TrustPlay. All rights reserved. Built for the football community.
        </motion.div>
      </div>
    </footer>
  )
} 