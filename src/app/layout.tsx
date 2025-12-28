import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { SettingsProvider } from '@/contexts/SettingsContext'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'SafeMed - Medication Safety Platform',
  description: 'AI-powered medication safety platform to prevent dangerous drug interactions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans">
        <SettingsProvider>
          {children}
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
        </SettingsProvider>
      </body>
    </html>
  )
}

