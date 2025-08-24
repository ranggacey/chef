import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'soft' | 'medium' | 'strong'
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  shadow = 'soft'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }
  
  const shadowClasses = {
    none: '',
    soft: 'shadow-sm',
    medium: 'shadow-md',
    strong: 'shadow-lg'
  }
  
  const baseClasses = `bg-white rounded-2xl border border-gray-200 ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`
  
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className={`${baseClasses} cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all duration-200`}
      >
        {children}
      </motion.div>
    )
  }
  
  return (
    <div className={baseClasses}>
      {children}
    </div>
  )
}