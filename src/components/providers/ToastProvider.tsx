'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1a2332',
          color: '#f1f5f9',
          border: '1px solid #2d3d4e',
          borderRadius: '12px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          padding: '16px',
        },
        success: {
          iconTheme: {
            primary: '#22d3ee',
            secondary: '#ffffff',
          },
          style: {
            border: '1px solid rgba(34, 211, 238, 0.3)',
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
          },
        },
        loading: {
          iconTheme: {
            primary: '#22d3ee',
            secondary: '#ffffff',
          },
        },
      }}
    />
  )
}

