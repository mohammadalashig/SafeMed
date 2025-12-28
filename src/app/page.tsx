'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Pill, Shield, Zap, Globe, Heart, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const features = [
    { icon: Shield, text: 'Drug Interaction Safety', color: 'text-medical-400' },
    { icon: Zap, text: 'AI-Powered Analysis', color: 'text-safety-400' },
    { icon: Globe, text: 'Turkish Equivalents', color: 'text-medical-400' },
    { icon: Heart, text: 'Medication Management', color: 'text-safety-400' },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-medical-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-safety-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 max-w-4xl relative z-10"
      >
        {/* Logo Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-medical-500/30 rounded-full blur-2xl animate-pulse" />
            <div className="relative p-6 bg-gradient-to-br from-medical-500 to-safety-500 rounded-2xl shadow-neon-lg">
              <Pill className="w-16 h-16 text-white" />
            </div>
          </div>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-display font-bold bg-gradient-to-r from-medical-400 to-safety-400 bg-clip-text text-transparent">
          SafeMed
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto">
          AI-powered medication safety platform to prevent dangerous drug interactions
        </p>

        {/* Feature Icons */}
        <div className="flex flex-wrap justify-center gap-6 pt-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="p-3 bg-dark-800/50 rounded-lg border border-dark-600/50">
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <span className="text-sm text-slate-400">{feature.text}</span>
              </motion.div>
            )
          })}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link
            href="/auth/signup"
            className="bg-gradient-to-r from-medical-600 to-medical-500 text-white font-bold px-8 py-4 rounded-xl hover:shadow-neon-lg hover:scale-105 transition-all duration-300"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="bg-dark-800 text-slate-100 border border-dark-600 font-semibold px-8 py-4 rounded-xl hover:bg-dark-700 hover:border-medical-500 hover:-translate-y-0.5 transition-all duration-300"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

