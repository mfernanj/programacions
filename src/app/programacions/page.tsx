'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import type { CursEscolar, Nivell } from '@/types/domain'

interface Programacio {
  id: string
  titol: string
  descripcio: string | null
  estat: string
  versio: number
  nivell: { nom: string; codi: string }
  materia: { nom: string }
  cursEscolar: { anyInici: number; anyFi: number }
  autor: { nom: string }
  _count: { unitatsDidactiques: number }
  updatedAt: string
}

export default function ProgramacionsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [programacions, setProgramacions] = useState<Programacio[]>([])
  const [cursos, setCursos] = useState<CursEscolar[]>([])
  const [nivells, setNivells] = useState<Nivell[]>([])
  const [filtreCurs, setFiltreCurs] = useState('')
  const [filtreNivell, setFiltreNivell] = useState('')

  const carregarProgramacions = async () => {
    const params = new URLSearchParams()
    if (filtreCurs) params.set('cursEscolarId', filtreCurs)
    if (filtreNivell) params.set('nivellId', filtreNivell)
    const query = params.toString()
    const url = query ? `/api/programacions?${query}` : '/api/programacions'
    const res = await fetch(url)
    const data = await res.json()
    setProgramacions(data)
  }

  const eliminarProgramacio = async (id: string) => {
    if (!confirm('Estàs segur d\'eliminar aquesta programació?')) return

    const res = await fetch(`/api/programacions/${id}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      carregarProgramacions()
    } else {
      alert('Error eliminant la programació')
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    fetch('/api/nivells')
      .then(res => res.json())
      .then(setNivells)
    fetch('/api/cursos')
      .then(res => res.json())
      .then(setCursos)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (filtreCurs) params.set('cursEscolarId', filtreCurs)
    if (filtreNivell) params.set('nivellId', filtreNivell)
    const query = params.toString()
    fetch(query ? `/api/programacions?${query}` : '/api/programacions')
      .then((res) => res.json())
      .then(setProgramacions)
  }, [filtreCurs, filtreNivell])

  if (status === 'loading') return <div className="flex min-h-screen items-center justify-center"><p>Carregant...</p></div>
  if (status === 'unauthenticated') return null

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Programacions Didàctiques</h1>
            <p className="mt-1 text-gray-500">Gestiona les programacions del departament</p>
          </div>
          <Link
            href="/programacions/nova"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            + Nova programació
          </Link>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={filtreCurs}
            onChange={(e) => setFiltreCurs(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Tots els cursos escolars</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>{c.anyInici}/{c.anyFi} {c.actiu ? '(actiu)' : ''}</option>
            ))}
          </select>
          <select
            value={filtreNivell}
            onChange={(e) => setFiltreNivell(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Tots els nivells</option>
            {nivells.map((n) => (
              <option key={n.id} value={n.id}>{n.nom}</option>
            ))}
          </select>
        </div>

        {/* Llista de programacions */}
        {programacions.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-md">
            <p className="text-lg text-gray-500">No hi ha programacions encara.</p>
            <Link href="/programacions/nova" className="mt-4 inline-block text-primary hover:underline">
              Crea la primera programació
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programacions.map((prog) => (
              <div key={prog.id} className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{prog.titol}</h3>
                    <div className="text-sm text-gray-500">
                      <p>{prog.nivell?.nom} · {prog.materia?.nom}</p>
                      <p>Curs {prog.cursEscolar?.anyInici}/{prog.cursEscolar?.anyFi}</p>
                      <p>v{prog.versio} · {prog._count?.unitatsDidactiques} unitats</p>
                      <p className="text-xs">Autor: {prog.autor?.nom}</p>
                    </div>
                  </div>

                  <Link
                    href={`/programacions/${prog.id}`}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
                  >
                    Veure
                  </Link>
                </div>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  prog.estat === 'esborrany' ? 'bg-yellow-100 text-yellow-800' :
                  prog.estat === 'publicat' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {prog.estat}
                </span>
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => eliminarProgramacio(prog.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Eliminar aquesta programació
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
