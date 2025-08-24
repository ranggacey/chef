import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral' | 'warning'
  icon: React.ReactNode
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning'
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color
}) => {
  const colorClasses = {
    primary: 'from-blue-500 to-blue-600',
    secondary: 'from-green-500 to-green-600',
    accent: 'from-purple-500 to-purple-600',
    success: 'from-emerald-500 to-emerald-600',
    warning: 'from-orange-500 to-orange-600'
  }
  
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
    warning: 'text-orange-600 bg-orange-50'
  }

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-3 h-3" />
      case 'negative':
        return <TrendingDown className="w-3 h-3" />
      default:
        return <Minus className="w-3 h-3" />
    }
  }
  
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {change && (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${changeColors[changeType]}`}>
                {getChangeIcon()}
                <span>{change}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
        </div>
        
        {/* Decorative gradient overlay */}
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses[color]} opacity-5 rounded-full -translate-y-12 translate-x-12`} />
        
        {/* Subtle border accent */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]} opacity-20`} />
      </Card>
    </motion.div>
  )
}