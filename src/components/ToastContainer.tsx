'use client'

import { useState, useCallback } from 'react'
import Toast, { ToastMessage } from './Toast'

export interface ToastContainerProps {
  children: (showToast: (toast: Omit<ToastMessage, 'id'>) => void) => React.ReactNode
}

export default function ToastContainer({ children }: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastMessage = { ...toast, id }
    
    setToasts(current => [...current, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  return (
    <>
      {children(showToast)}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="animate-slide-in-right"
          >
            <Toast toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}