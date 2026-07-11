"use client"

import { useEffect, useState } from 'react'

export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
    }
    try { localStorage.setItem('theme', theme) } catch (e) { /* ignore */ }
  }, [theme])

  return (
    <button
      aria-label="Conmutador tema"
      onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
      className={"inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm hover:opacity-90 " + (className || '')}
    >
      {theme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 3.22l.61 1.86a1 1 0 00.95.69h1.96l-1.58 1.15a1 1 0 00-.36 1.27L13 11l-1.42.81a1 1 0 00-.36 1.27L13 14.78l-1.96-.01a1 1 0 00-.95.69L10 17.78 9.39 15.92a1 1 0 00-.95-.69H6.48l1.58-1.15a1 1 0 00.36-1.27L7 9l1.42-.81a1 1 0 00.36-1.27L7 5.22l1.96.01a1 1 0 00.95-.69L10 3.22z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 116.707 2.707a7 7 0 0010.586 10.586z" />
        </svg>
      )}
    </button>
  )
}
