import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 rounded-xl border-2 border-gray-200 
            focus:ring-4 focus:ring-blue-100 focus:border-blue-500 
            transition-all duration-200 bg-white placeholder-gray-400
            ${leftIcon ? 'pl-12' : ''}
            ${rightIcon ? 'pr-12' : ''}
            ${error ? 'border-red-500 focus:ring-red-100 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  )
}