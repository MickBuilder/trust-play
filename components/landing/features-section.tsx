'use client'

import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, 
  Trophy, 
  Star, 
  Zap, 
  Shield, 
  Smartphone
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const features = [
  {
    icon: Star,
    title: "Simplified Rating System",
    description: "Rate players with an overall score plus play type (Fun, Competitive, Fair Play, Technical, Social, Reliable)",
    gradient: "from-green-500/20 to-green-600/10",
    iconBg: "from-green-500 to-green-600",
    iconColor: "text-white"
  },
  {
    icon: Smartphone,
    title: "QR Code Sessions",
    description: "Scan QR codes at sessions to join, participate, and unlock rating opportunities seamlessly",
    gradient: "from-blue-500/20 to-blue-600/10",
    iconBg: "from-blue-500 to-blue-600",
    iconColor: "text-white"
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Build authentic reputation through peer feedback from actual teammates and opponents",
    gradient: "from-purple-500/20 to-purple-600/10",
    iconBg: "from-purple-500 to-purple-600",
    iconColor: "text-white"
  },
  {
    icon: Trophy,
    title: "MVP Recognition",
    description: "Earn MVP status and build your football legacy with achievement badges and milestones",
    gradient: "from-orange-500/20 to-orange-600/10",
    iconBg: "from-orange-500 to-orange-600",
    iconColor: "text-white"
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "Verified sessions and mutual rating requirements ensure authentic, quality feedback",
    gradient: "from-emerald-500/20 to-emerald-600/10",
    iconBg: "from-emerald-500 to-emerald-600",
    iconColor: "text-white"
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Get instant notifications for session invites, ratings received, and community updates",
    gradient: "from-cyan-500/20 to-cyan-600/10",
    iconBg: "from-cyan-500 to-cyan-600",
    iconColor: "text-white"
  }
]

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

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      type: "spring",
      stiffness: 100
    }
  }
}

export function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900 border-t border-gray-800/50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4">
            Why TrustPlay Changes Everything
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            From pickup games to organized leagues, build trust and connections through peer-to-peer ratings
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={cardVariants}>
              <motion.div
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 5,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="h-full"
              >
                <Card className="border border-gray-800/50 shadow-2xl shadow-black/20 hover:shadow-green-500/10 transition-all duration-500 h-full bg-gray-900/50 backdrop-blur-sm">
                  <CardContent className="p-8 text-center h-full flex flex-col">
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-br ${feature.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-black/20`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-green-400 transition-colors">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed flex-grow">
                      {feature.description}
                    </p>
                    
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl`}></div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
} 