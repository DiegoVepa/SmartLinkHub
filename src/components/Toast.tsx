'use client'

import { useEffect } from 'react'
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface ToastProps {
  toast: ToastMessage
  onRemove: (id: string) => void
}

export default function Toast({ toast, onRemove }: ToastProps) {
  const { id, type, title, message, duration = 5000 } = toast

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onRemove])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-l-green-400'
      case 'error':
        return 'border-l-red-400'
      case 'warning':
        return 'border-l-yellow-400'
      case 'info':
        return 'border-l-blue-400'
      default:
        return 'border-l-blue-400'
    }
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border-l-4 ${getBorderColor()} p-4 max-w-sm w-full transform transition-all duration-300 ease-in-out`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {message && (
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          )}
        </div>
        
        <button
          onClick={() => onRemove(id)}
          className="ml-4 flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}