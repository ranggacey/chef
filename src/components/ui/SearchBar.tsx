import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  className = '',
  size = 'md'
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Size variants
  const sizeClasses = {
    sm: {
      container: 'h-8',
      icon: 'w-3 h-3',
      input: 'text-sm',
      button: 'w-8 h-8'
    },
    md: {
      container: 'h-10',
      icon: 'w-4 h-4',
      input: 'text-sm',
      button: 'w-10 h-10'
    },
    lg: {
      container: 'h-12',
      icon: 'w-5 h-5',
      input: 'text-base',
      button: 'w-12 h-12'
    }
  }

  const currentSize = sizeClasses[size]

  // Auto focus when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  // Auto expand if there's already a value
  useEffect(() => {
    if (value && !isExpanded) {
      setIsExpanded(true)
    }
  }, [value])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (inputRef.current && !inputRef.current.closest('.search-container')?.contains(target)) {
        if (!value) {
          setIsExpanded(false)
        }
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded, value])

  const handleExpand = () => {
    setIsExpanded(true)
  }

  const handleClear = () => {
    onChange('')
    setIsExpanded(false)
    inputRef.current?.blur()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (!value) {
        setIsExpanded(false)
        inputRef.current?.blur()
      }
    }
  }

  return (
    <div className={`search-container relative ${className}`}>
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          // Collapsed state - just the icon
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleExpand}
            className={`
              ${currentSize.button} ${currentSize.container}
              flex items-center justify-center
              bg-neutral-100 hover:bg-neutral-200 
              text-neutral-500 hover:text-neutral-700
              rounded-lg transition-all duration-200
              hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500
            `}
          >
            <Search className={currentSize.icon} />
          </motion.button>
        ) : (
          // Expanded state - full input
          <motion.div
            key="expanded"
            initial={{ opacity: 0, width: currentSize.button }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: currentSize.button }}
            className={`
              ${currentSize.container}
              flex items-center
              bg-white border border-neutral-200 rounded-lg
              shadow-sm hover:shadow-md transition-all duration-200
              focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-opacity-20
              min-w-[200px] sm:min-w-[250px] md:min-w-[300px]
            `}
          >
            <Search className={`${currentSize.icon} text-neutral-400 ml-3 flex-shrink-0`} />
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className={`
                ${currentSize.input}
                flex-1 px-3 py-2 bg-transparent border-none outline-none
                text-neutral-900 placeholder:text-neutral-400
              `}
            />
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleClear}
                className="p-1 mr-2 text-neutral-400 hover:text-neutral-600 rounded transition-colors flex-shrink-0"
              >
                <X className={currentSize.icon} />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 