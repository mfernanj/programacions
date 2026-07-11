'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

interface UnitatDidactica {
  id: string
  titol: string
  temporitzacio: string
  dataInici?: string | null
  dataFi?: string | null
  ordre: number
}

interface Programacio {
  id: string
  titol: string
  descripcio: string | null
  nivell: { nom: string }
  materia: { nom: string }
  cursEscolar: { anyInici: number; anyFi: number }
  unitatsDidactiques: UnitatDidactica[]
}

export default function CalendariProgramacioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [programacio, setProgramacio] = useState<Programacio | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (params.id) {
      fetch(`/api/programacions/${params.id}`)
        .then((res) => res.json())
        .then(setProgramacio)
    }
  }, [params.id])

  if (status === 'loading' || !programacio) {
    return <div className="flex min-h-screen items-center justify-center"><p>Carregant...</p></div>
  }

  if (status === 'unauthenticated') return null

  const sortedUnitats = [...programacio.unitatsDidactiques].sort((a, b) => {
    const aDate = a.dataInici ? new Date(a.dataInici).getTime() : Number.MAX_SAFE_INTEGER
    const bDate = b.dataInici ? new Date(b.dataInici).getTime() : Number.MAX_SAFE_INTEGER
    return aDate - bDate || a.ordre - b.ordre
  })

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-8">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendari de la programació</h1>
              <p className="mt-1 text-gray-500">{programacio.titol}</p>
              <p className="mt-2 text-sm text-gray-600">{programacio.nivell.nom} · {programacio.materia.nom} · Curs {programacio.cursEscolar.anyInici}/{programacio.cursEscolar.anyFi}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/programacions/${programacio.id}`} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Tornar a la programació
              </Link>
              <Link href="/programacions" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                Programacions
              </Link>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900">Planificació temporal</h2>
            <p className="mt-2 text-sm text-gray-600">Aquesta vista mostra les unitats didàctiques amb les dates d'inici i finalització assignades.</p>
          </div>
        </div>

        {sortedUnitats.length === 0 ? (
          <div className="rounded-lg bg-white p-12 shadow-md text-center">
            <p className="text-lg font-medium text-gray-900">No hi ha unitats a calendari</p>
            <p className="mt-2 text-gray-500">Afegiu unitats a la programació des de la seva pàgina de detall i marqueu les dates.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedUnitats.map((unitat) => (
              <div key={unitat.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Unitat {unitat.ordre}</p>
                    <h3 className="text-xl font-semibold text-gray-900">{unitat.titol}</h3>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 text-sm text-gray-700">
                    <div>
                      <p className="text-xs uppercase text-gray-400">Temporització</p>
                      <p>{unitat.temporitzacio || 'No assignada'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-400">Data d'inici</p>
                      <p>{unitat.dataInici ? new Date(unitat.dataInici).toLocaleDateString() : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-400">Data de fi</p>
                      <p>{unitat.dataFi ? new Date(unitat.dataFi).toLocaleDateString() : '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
