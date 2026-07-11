'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

const formatDateForInput = (value?: string | null) => {
  if (!value) return ''
  return value.slice(0, 10)
}

interface ProgramacioRef {
  id: string
  titol: string
  estat: string
  cursEscolar: { anyInici: number; anyFi: number }
  nivell: { nom: string }
  materia: { nom: string }
}

interface UnitatDidactica {
  id: string
  titol: string
  temporitzacio: string
  dataInici?: string | null
  dataFi?: string | null
  objectius: string
  continguts: string
  criterisAvaluacio: string | null
  competencies: string | null
  activitats: string | null
  ordre: number
  programacio: ProgramacioRef
}

export default function UnitatsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [unitats, setUnitats] = useState<UnitatDidactica[]>([])
  const [programacions, setProgramacions] = useState<ProgramacioRef[]>([])
  const [selectedProgramacioId, setSelectedProgramacioId] = useState<string>('')
  const [editantUnitat, setEditantUnitat] = useState<string | null>(null)
  const [unitatEnEdicio, setUnitatEnEdicio] = useState<Record<string, UnitatDidactica>>({})

  const carregarUnitats = async (programacioId?: string) => {
    const url = programacioId ? `/api/unitats?programacioId=${programacioId}` : '/api/unitats'
    const res = await fetch(url)
    const data = await res.json()
    setUnitats(data)
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    // fetch programacions for the filter
    const carregarProgramacions = async () => {
      const res = await fetch('/api/programacions')
      const data = await res.json()
      setProgramacions(data)
    }
    carregarProgramacions()
  }, [])

  const iniciarEdicioUnitat = (unitat: UnitatDidactica) => {
    setEditantUnitat(unitat.id)
    setUnitatEnEdicio(prev => ({ ...prev, [unitat.id]: unitat }))
  }

  const canviUnitatEnEdicio = (id: string, field: keyof UnitatDidactica, value: string | number) => {
    setUnitatEnEdicio(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
  }

  const desarUnitat = async (id: string) => {
    const unitat = unitatEnEdicio[id]
    if (!unitat) return

    const res = await fetch(`/api/unitats/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unitat),
    })

    if (res.ok) {
      setEditantUnitat(null)
      setUnitatEnEdicio(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      carregarUnitats()
    } else {
      alert('Error desant la unitat')
    }
  }

  const cancel·larEdicioUnitat = (id: string) => {
    setEditantUnitat(null)
    setUnitatEnEdicio(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center"><p>Carregant...</p></div>
  }

  if (status === 'unauthenticated') return null

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Unitats Didàctiques</h1>
            <p className="mt-1 text-gray-500">Accedeix a les unitats creades dins de cada programació.</p>
          </div>
          <Link
            href="/programacions"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Tornar a programacions
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtra per programació:</label>
          <select
            value={selectedProgramacioId}
            onChange={(e) => {
              const id = e.target.value
              setSelectedProgramacioId(id)
              if (id) carregarUnitats(id)
              else setUnitats([])
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">-- Tria una programació --</option>
            {programacions.map((p) => (
              <option key={p.id} value={p.id}>{p.titol} ({p.nivell.nom} · {p.materia.nom})</option>
            ))}
          </select>
        </div>

        {unitats.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-md">
            <p className="text-lg text-gray-500">No hi ha unitats didàctiques per a la programació seleccionada.</p>
            <p className="mt-2 text-sm text-gray-400">Crea-les des de la pàgina de detall d'una programació.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {unitats.map((unitat) => {
              const enEdicio = editantUnitat === unitat.id
              const unitatEdit = unitatEnEdicio[unitat.id] || unitat

              return (
                <div key={unitat.id} className="rounded-lg bg-white p-6 shadow-md">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{unitat.titol}</h2>
                      <p className="text-sm text-gray-500">Unitat {unitat.ordre} · {unitat.programacio.nivell.nom} · {unitat.programacio.materia.nom}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => iniciarEdicioUnitat(unitat)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edita
                      </button>
                      <Link
                        href={`/programacions/${unitat.programacio.id}`}
                        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
                      >
                        Veure programació
                      </Link>
                    </div>
                  </div>

                  <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                    <p><strong>Programació:</strong> {unitat.programacio.titol}</p>
                    <p><strong>Curs:</strong> {unitat.programacio.cursEscolar.anyInici}/{unitat.programacio.cursEscolar.anyFi}</p>
                    <p><strong>Estat:</strong> {unitat.programacio.estat}</p>
                  </div>

                  {enEdicio ? (
                    <div className="space-y-3">
                      <input
                        value={unitatEdit.titol}
                        onChange={(e) => canviUnitatEnEdicio(unitat.id, 'titol', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Títol de la unitat"
                      />
                      <input
                        value={unitatEdit.temporitzacio}
                        onChange={(e) => canviUnitatEnEdicio(unitat.id, 'temporitzacio', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Temporització"
                      />
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block text-sm text-gray-700">
                          Data d'inici
                          <input
                            type="date"
                            value={formatDateForInput(unitatEdit.dataInici)}
                            onChange={(e) => canviUnitatEnEdicio(unitat.id, 'dataInici', e.target.value)}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="block text-sm text-gray-700">
                          Data de finalització
                          <input
                            type="date"
                            value={formatDateForInput(unitatEdit.dataFi)}
                            onChange={(e) => canviUnitatEnEdicio(unitat.id, 'dataFi', e.target.value)}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          />
                        </label>
                      </div>
                      <textarea
                        value={unitatEdit.objectius}
                        onChange={(e) => canviUnitatEnEdicio(unitat.id, 'objectius', e.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Objectius"
                      />
                      <textarea
                        value={unitatEdit.continguts}
                        onChange={(e) => canviUnitatEnEdicio(unitat.id, 'continguts', e.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Continguts"
                      />
                      <textarea
                        value={unitatEdit.criterisAvaluacio || ''}
                        onChange={(e) => canviUnitatEnEdicio(unitat.id, 'criterisAvaluacio', e.target.value)}
                        rows={2}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Criteris"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => desarUnitat(unitat.id)}
                          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                        >
                          Desa
                        </button>
                        <button
                          type="button"
                          onClick={() => cancel·larEdicioUnitat(unitat.id)}
                          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel·lar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3 text-sm text-gray-600">
                      <p><strong>Temporització:</strong> {unitat.temporitzacio}</p>
                      {unitat.dataInici && <p><strong>Inici:</strong> {new Date(unitat.dataInici).toLocaleDateString()}</p>}
                      {unitat.dataFi && <p><strong>Fi:</strong> {new Date(unitat.dataFi).toLocaleDateString()}</p>}
                      <p><strong>Objectius:</strong> {unitat.objectius}</p>
                      <p><strong>Continguts:</strong> {unitat.continguts}</p>
                      {unitat.criterisAvaluacio && <p><strong>Criteris:</strong> {unitat.criterisAvaluacio}</p>}
                      {unitat.competencies && <p><strong>Competències:</strong> {unitat.competencies}</p>}
                      {unitat.activitats && <p><strong>Activitats:</strong> {unitat.activitats}</p>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
