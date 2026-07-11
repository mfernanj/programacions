'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import ThemeToggle from './ThemeToggle'

const menuItems = [
  { href: '/dashboard', label: 'Inici', icon: '📊' },
  { href: '/programacions', label: 'Programacions', icon: '📋' },
  { href: '/unitats', label: 'Unitats Didàctiques', icon: '📚' },
  { href: '/examens', label: 'Repositori d\'Exàmens', icon: '📝' },
  { href: '/plantilles', label: 'Plantilles', icon: '📄' },
  { href: '/usuaris', label: 'Usuaris', icon: '👥' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col bg-white shadow-lg">
      <div className="flex items-center justify-between gap-2 border-b px-6 py-4">
        <span className="text-2xl">📐</span>
        <div>
          <h2 className="text-sm font-bold text-gray-800">Programacions</h2>
          <p className="text-xs text-gray-500">Dept. Matemàtiques</p>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t px-3 py-4">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <span>🚪</span>
          Tancar sessió
        </button>
      </div>
    </aside>
  )
}