import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/lib/auth'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gestor de Programacions Didàctiques',
  description: 'Aplicació per a la gestió de programacions didàctiques del departament de matemàtiques',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="ca">
      <body className="min-h-screen bg-background text-gray-900 antialiased">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}