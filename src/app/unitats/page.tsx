'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

interface SituacioAprenentatge {
  id: string
  titol: string
  descripcio?: string | null
  competenciesEspecifiques: string
  mesuresSuportsUniversals: string
  activitatsInicials: string
  activitatsDesenvolupament: string
  activitatsEstructuracio: string
  activitatsAplicacio: string
  ordre: number
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
  situacionsAprenentatge?: SituacioAprenentatge[]
}

export default function UnitatsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [unitats, setUnitats] = useState<UnitatDidactica[]>([])
  const [programacions, setProgramacions] = useState<ProgramacioRef[]>([])
  const [selectedProgramacioId, setSelectedProgramacioId] = useState<string>('')

  const [editantSituacio, setEditantSituacio] = useState<string | null>(null)
  const [situacioEnEdicio, setSituacioEnEdicio] = useState<Record<string, SituacioAprenentatge>>({})
  const [novaSituacio, setNovaSituacio] = useState<Record<string, boolean>>({})
  const [formSituacio, setFormSituacio] = useState<Record<string, Record<string, string>>>({})

  const carregarUnitats = async (programacioId?: string) => {
    const url = programacioId ? `/api/unitats?programacioId=${programacioId}` : '/api/unitats'
    const res = await fetch(url)
    const data = await res.json()
    const unitatsAmbSA = await Promise.all(
      data.map(async (u: UnitatDidactica) => {
        const resSA = await fetch(`/api/situacions?unitatId=${u.id}`)
        const sa = await resSA.json()
        return { ...u, situacionsAprenentatge: sa }
      })
    )
    setUnitats(unitatsAmbSA)
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    fetch('/api/programacions').then(r => r.json()).then(setProgramacions)
  }, [])

  const obrirNovaSituacio = (unitatId: string) => {
    setNovaSituacio(prev => ({ ...prev, [unitatId]: true }))
    setFormSituacio(prev => ({
      ...prev,
      [unitatId]: {
        titol: '',
        descripcio: '',
        competenciesEspecifiques: '',
        mesuresSuportsUniversals: '',
        activitatsInicials: '',
        activitatsDesenvolupament: '',
        activitatsEstructuracio: '',
        activitatsAplicacio: '',
      },
    }))
  }

  const tancarNovaSituacio = (unitatId: string) => {
    setNovaSituacio(prev => ({ ...prev, [unitatId]: false }))
    setFormSituacio(prev => { const n = { ...prev }; delete n[unitatId]; return n })
  }

  const afegirSituacio = async (unitatId: string) => {
    const form = formSituacio[unitatId]
    if (!form || !form.titol) return
    const res = await fetch('/api/situacions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titol: form.titol,
        descripcio: form.descripcio || '',
        competenciesEspecifiques: form.competenciesEspecifiques || '',
        mesuresSuportsUniversals: form.mesuresSuportsUniversals || '',
        activitatsInicials: form.activitatsInicials || '',
        activitatsDesenvolupament: form.activitatsDesenvolupament || '',
        activitatsEstructuracio: form.activitatsEstructuracio || '',
        activitatsAplicacio: form.activitatsAplicacio || '',
        unitatDidacticaId: unitatId,
        ordre: (unitats.find(u => u.id === unitatId)?.situacionsAprenentatge?.length || 0) + 1,
      }),
    })
    if (res.ok) {
      tancarNovaSituacio(unitatId)
      carregarUnitats(selectedProgramacioId)
    } else {
      alert('Error afegint la situacio')
    }
  }

  const iniciarEdicioSituacio = (situacio: SituacioAprenentatge) => {
    setEditantSituacio(situacio.id)
    setSituacioEnEdicio(prev => ({ ...prev, [situacio.id]: situacio }))
  }

  const canviSituacioEnEdicio = (id: string, field: keyof SituacioAprenentatge, value: string | number) => {
    setSituacioEnEdicio(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const desarSituacio = async (id: string) => {
    const situacio = situacioEnEdicio[id]
    if (!situacio) return
    const res = await fetch(`/api/situacions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(situacio),
    })
    if (res.ok) {
      setEditantSituacio(null)
      setSituacioEnEdicio(prev => { const n = { ...prev }; delete n[id]; return n })
      carregarUnitats(selectedProgramacioId)
    } else {
      alert('Error desant la situacio')
    }
  }

  const cancel·larEdicioSituacio = (id: string) => {
    setEditantSituacio(null)
    setSituacioEnEdicio(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  const eliminarSituacio = async (id: string) => {
    if (confirm('Estas segur?')) {
      await fetch(`/api/situacions/${id}`, { method: 'DELETE' })
      carregarUnitats(selectedProgramacioId)
    }
  }

  const editarFormSituacio = (unitatId: string, field: string, value: string) => {
    setFormSituacio(prev => ({
      ...prev,
      [unitatId]: { ...(prev[unitatId] || {}), [field]: value },
    }))
  }

  if (status === 'loading') return <div className="flex min-h-screen items-center justify-center"><p>Carregant...</p></div>
  if (status === 'unauthenticated') return null

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Unitats Didactiques</h1>
            <p className="mt-1 text-gray-500">Gestiona les unitats i les situacions d'aprenentatge.</p>
          </div>
          <Link href="/programacions" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Tornar</Link>
        </div>

        <div className="mb-6">
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
            <option value="">-- Tria una programacio --</option>
            {programacions.map((p) => (
              <option key={p.id} value={p.id}>{p.titol} ({p.nivell.nom})</option>
            ))}
          </select>
        </div>

        {unitats.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-md">
            <p className="text-lg text-gray-500">No hi ha unitats.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {unitats.map((unitat) => {
              return (
                <div key={unitat.id} className="rounded-lg bg-white p-6 shadow-md">
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">{unitat.titol}</h2>
                    <p className="text-sm text-gray-500">Unitat {unitat.ordre} · {unitat.programacio.nivell.nom} · {unitat.programacio.materia.nom}</p>
                  </div>

                  {/* SA */}
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-medium text-gray-800">Situacions d'Aprenentatge</h4>
                      <button onClick={() => obrirNovaSituacio(unitat.id)} className="rounded-md bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700">+ Afegir SA</button>
                    </div>

                    {novaSituacio[unitat.id] && (
                      <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
                        <div className="space-y-2">
                          <input placeholder="Titol" onChange={e => editarFormSituacio(unitat.id, 'titol', e.target.value)} className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm" />
                          <textarea placeholder="Competencies especifiques" onChange={e => editarFormSituacio(unitat.id, 'competenciesEspecifiques', e.target.value)} rows={2} className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm" />
                          <textarea placeholder="Mesures i suports universals" onChange={e => editarFormSituacio(unitat.id, 'mesuresSuportsUniversals', e.target.value)} rows={2} className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm" />
                          <label className="text-xs font-medium text-green-700">
                            Activitats inicials (Què sabem?)
                            <textarea onChange={e => editarFormSituacio(unitat.id, 'activitatsInicials', e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm" />
                          </label>
                          <label className="text-xs font-medium text-blue-700">
                            Activitats de desenvolupament (Aprenem nous sabers)
                            <textarea onChange={e => editarFormSituacio(unitat.id, 'activitatsDesenvolupament', e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm" />
                          </label>
                          <label className="text-xs font-medium text-yellow-700">
                            Activitats d'estructuració (Què hem après?)
                            <textarea onChange={e => editarFormSituacio(unitat.id, 'activitatsEstructuracio', e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm" />
                          </label>
                          <label className="text-xs font-medium text-orange-700">
                            Activitats d'aplicació (Apliquem el que hem après)
                            <textarea onChange={e => editarFormSituacio(unitat.id, 'activitatsAplicacio', e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm" />
                          </label>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => tancarNovaSituacio(unitat.id)} className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700">Cancel·lar</button>
                            <button onClick={() => afegirSituacio(unitat.id)} className="rounded-md bg-primary px-2 py-1 text-xs text-white">Guardar</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {unitat.situacionsAprenentatge && unitat.situacionsAprenentatge.length > 0 ? (
                      <div className="space-y-2">
                        {unitat.situacionsAprenentatge.map((sa) => {
                          const enEdicioSA = editantSituacio === sa.id
                          const saEdit = situacioEnEdicio[sa.id] || sa
                          return (
                            <div key={sa.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                              {enEdicioSA ? (
                                <div className="space-y-2">
                                  <input
                                    value={saEdit.titol}
                                    onChange={(e) => canviSituacioEnEdicio(sa.id, 'titol', e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                  />
                                  <textarea
                                    value={saEdit.descripcio || ''}
                                    onChange={(e) => canviSituacioEnEdicio(sa.id, 'descripcio', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                  />
                                  <textarea
                                    value={saEdit.competenciesEspecifiques}
                                    onChange={(e) => canviSituacioEnEdicio(sa.id, 'competenciesEspecifiques', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                  />
                                  <textarea
                                    value={saEdit.mesuresSuportsUniversals}
                                    onChange={(e) => canviSituacioEnEdicio(sa.id, 'mesuresSuportsUniversals', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                  />
                                  <label className="text-xs font-medium text-green-700">
                                    Activitats inicials (Què sabem?)
                                    <textarea
                                      value={saEdit.activitatsInicials}
                                      onChange={(e) => canviSituacioEnEdicio(sa.id, 'activitatsInicials', e.target.value)}
                                      rows={2}
                                      className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                    />
                                  </label>
                                  <label className="text-xs font-medium text-blue-700">
                                    Activitats de desenvolupament
                                    <textarea
                                      value={saEdit.activitatsDesenvolupament}
                                      onChange={(e) => canviSituacioEnEdicio(sa.id, 'activitatsDesenvolupament', e.target.value)}
                                      rows={2}
                                      className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                    />
                                  </label>
                                  <label className="text-xs font-medium text-yellow-700">
                                    Activitats d'estructuració
                                    <textarea
                                      value={saEdit.activitatsEstructuracio}
                                      onChange={(e) => canviSituacioEnEdicio(sa.id, 'activitatsEstructuracio', e.target.value)}
                                      rows={2}
                                      className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                    />
                                  </label>
                                  <label className="text-xs font-medium text-orange-700">
                                    Activitats d'aplicació
                                    <textarea
                                      value={saEdit.activitatsAplicacio}
                                      onChange={(e) => canviSituacioEnEdicio(sa.id, 'activitatsAplicacio', e.target.value)}
                                      rows={2}
                                      className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                    />
                                  </label>
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => cancel·larEdicioSituacio(sa.id)} className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700">Cancel·lar</button>
                                    <button onClick={() => desarSituacio(sa.id)} className="rounded-md bg-primary px-2 py-1 text-xs text-white">Desa</button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-start justify-between">
                                    <h5 className="font-medium text-gray-800">{sa.titol}</h5>
                                    <div className="flex gap-1">
                                      <button onClick={() => iniciarEdicioSituacio(sa)} className="rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-700">Edita</button>
                                      <button onClick={() => eliminarSituacio(sa.id)} className="rounded-md border border-red-300 bg-red-50 px-2 py-0.5 text-xs text-red-700">Elimina</button>
                                    </div>
                                  </div>
                                  {sa.competenciesEspecifiques && <p className="mt-1 text-sm"><strong>Competencies:</strong> {sa.competenciesEspecifiques}</p>}
                                  {sa.activitatsInicials && <p className="mt-1 text-sm text-green-700"><strong>Inicials:</strong> {sa.activitatsInicials}</p>}
                                  {sa.activitatsDesenvolupament && <p className="mt-1 text-sm text-blue-700"><strong>Desenvolupament:</strong> {sa.activitatsDesenvolupament}</p>}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No hi ha SA encara.</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
