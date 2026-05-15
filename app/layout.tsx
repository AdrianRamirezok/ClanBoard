import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Caveat } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
});

const caveat = Caveat({ 
  subsets: ["latin"],
  variable: "--font-handwritten",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: 'HomeBoard - Gestión del Hogar',
  description: 'Tu tablero familiar para organizar tareas del hogar de forma divertida',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#c4a77d',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable}`}>
      <body className="font-sans antialiased bg-background min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
        
      </body>
    </html>
  )
}
