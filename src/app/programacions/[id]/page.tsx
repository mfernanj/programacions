'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

const formatDateForInput = (value?: string | null) => {
  if (!value) return ''
  return value.slice(0, 10)
}

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
  situacionsAprenentatge?: SituacioAprenentatge[]
}

interface Programacio {
  id: string
  titol: string
  descripcio: string | null
  estat: string
  versio: number
  cursEscolarId: string
  nivell: { nom: string; codi: string }
  materia: { nom: string; blocs: Array<{ id: string; codi: string; nom: string; criterisAvaluacio: Array<{ id: string; codi: string; descripcio: string }> }> }
  cursEscolar: { anyInici: number; anyFi: number }
  autor: { nom: string; email: string }
  unitatsDidactiques: UnitatDidactica[]
  metodologies: Array<{ estrategies: string; recursos: string; agrupaments: string; avaluacio: string | null }>
  atencionsDiversitat: Array<{ mesuresGenerals: string; mesuresEspecifiques: string | null; adaptacions: string | null }>
}

export default function ProgramacioDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [programacio, setProgramacio] = useState<Programacio | null>(null)
  const [novaUnitat, setNovaUnitat] = useState(false)
  const [formUnitat, setFormUnitat] = useState({
    titol: '', temporitzacio: '', dataInici: '', dataFi: '', objectius: '', continguts: '',
    criterisAvaluacio: '', competencies: '', activitats: '',
  })
  const [editantUnitat, setEditantUnitat] = useState<string | null>(null)
  const [unitatEnEdicio, setUnitatEnEdicio] = useState<Record<string, UnitatDidactica>>({})
  const [editantProgramacio, setEditantProgramacio] = useState(false)
  const [formProgramacio, setFormProgramacio] = useState({
    titol: '', descripcio: '', estat: 'esborrany', cursEscolarId: '',
  })
  const [cursos, setCursos] = useState<any[]>([])

  // Estats per a situacions d'aprenentatge
  const [editantSituacio, setEditantSituacio] = useState<string | null>(null)
  const [situacioEnEdicio, setSituacioEnEdicio] = useState<Record<string, SituacioAprenentatge>>({})
  const [novaSituacio, setNovaSituacio] = useState<Record<string, boolean>>({})
  const [formSituacio, setFormSituacio] = useState<Record<string, {
    titol: string
    descripcio: string
    competenciesEspecifiques: string
    mesuresSuportsUniversals: string
    activitatsInicials: string
    activitatsDesenvolupament: string
    activitatsEstructuracio: string
    activitatsAplicacio: string
  }>>({})

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (params.id) {
      fetch(`/api/programacions/${params.id}`)
        .then(res => res.json())
        .then(setProgramacio)
    }
  }, [params.id])

  useEffect(() => {
    if (programacio) {
      setFormProgramacio({
        titol: programacio.titol,
        descripcio: programacio.descripcio || '',
        estat: programacio.estat,
        cursEscolarId: programacio.cursEscolarId || '',
      })
    }
  }, [programacio])

  useEffect(() => {
    fetch('/api/cursos').then(r => r.json()).then(setCursos)
  }, [])

  const afegirUnitat = async () => {
    const res = await fetch('/api/unitats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formUnitat,
        programacioId: params.id,
        ordre: ((programacio?.unitatsDidactiques?.length || 0) + 1),
      }),
    })
    if (res.ok) {
      setNovaUnitat(false)
      setFormUnitat({ titol: '', temporitzacio: '', dataInici: '', dataFi: '', objectius: '', continguts: '', criterisAvaluacio: '', competencies: '', activitats: '' })
      const updatedRes = await fetch(`/api/programacions/${params.id}`)
      if (updatedRes.ok) {
        const updated = await updatedRes.json()
        setProgramacio(updated)
      }
    }
  }

  const eliminarUnitat = async (id: string) => {
    if (confirm('Estàs segur d\'eliminar aquesta unitat?')) {
      await fetch(`/api/unitats?id=${id}`, { method: 'DELETE' })
      const updated = await fetch(`/api/programacions/${params.id}`).then(r => r.json())
      setProgramacio(updated)
    }
  }

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
      body: JSON.stringify({
        id: unitat.id,
        titol: unitat.titol,
        temporitzacio: unitat.temporitzacio,
        dataInici: unitat.dataInici || undefined,
        dataFi: unitat.dataFi || undefined,
        objectius: unitat.objectius,
        continguts: unitat.continguts,
        criterisAvaluacio: unitat.criterisAvaluacio,
        competencies: unitat.competencies,
        activitats: unitat.activitats,
        ordre: unitat.ordre,
      }),
    })

    if (res.ok) {
      const updated = await fetch(`/api/programacions/${params.id}`).then(r => r.json())
      if (updated && updated.unitatsDidactiques) {
        setProgramacio(updated)
      }
      setEditantUnitat(null)
    } else {
      const errorText = await res.text()
      console.error('Error desant la unitat:', res.status, errorText)
      alert('Error desant la unitat. Revisa la consola per a més detalls.')
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

  // Funcions per a situacions d'aprenentatge
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
    setFormSituacio(prev => {
      const next = { ...prev }
      delete next[unitatId]
      return next
    })
  }

  const afegirSituacio = async (unitatId: string) => {
    const form = formSituacio[unitatId]
    if (!form) return

    const res = await fetch('/api/situacions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        unitatDidacticaId: unitatId,
        ordre: (programacio?.unitatsDidactiques?.find(u => u.id === unitatId)?.situacionsAprenentatge?.length || 0) + 1,
      }),
    })

    if (res.ok) {
      tancarNovaSituacio(unitatId)
      const updated = await fetch(`/api/programacions/${params.id}`).then(r => r.json())
      setProgramacio(updated)
    } else {
      alert('Error afegint la situació d\'aprenentatge')
    }
  }

  const iniciarEdicioSituacio = (situacio: SituacioAprenentatge) => {
    setEditantSituacio(situacio.id)
    setSituacioEnEdicio(prev => ({ ...prev, [situacio.id]: situacio }))
  }

  const canviSituacioEnEdicio = (id: string, field: keyof SituacioAprenentatge, value: string | number) => {
    setSituacioEnEdicio(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
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
      setSituacioEnEdicio(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      const updated = await fetch(`/api/programacions/${params.id}`).then(r => r.json())
      setProgramacio(updated)
    } else {
      alert('Error desant la situació d\'aprenentatge')
    }
  }

  const cancel·larEdicioSituacio = (id: string) => {
    setEditantSituacio(null)
    setSituacioEnEdicio(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const eliminarSituacio = async (id: string) => {
    if (confirm('Estàs segur d\'eliminar aquesta situació d\'aprenentatge?')) {
      await fetch(`/api/situacions/${id}`, { method: 'DELETE' })
      const updated = await fetch(`/api/programacions/${params.id}`).then(r => r.json())
      setProgramacio(updated)
    }
  }

  const desarProgramacio = async () => {
    if (!programacio) return

    const res = await fetch(`/api/programacions/${programacio.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titol: formProgramacio.titol,
        descripcio: formProgramacio.descripcio,
        estat: formProgramacio.estat,
        cursEscolarId: formProgramacio.cursEscolarId,
      }),
    })

    if (res.ok) {
      const updatedRes = await fetch(`/api/programacions/${programacio.id}`)
      if (updatedRes.ok) {
        const updated = await updatedRes.json()
        setProgramacio(updated)
      }
      setEditantProgramacio(false)
    } else {
      alert('Error desant la programació')
    }
  }

  const eliminarProgramacio = async () => {
    if (!params.id) return
    if (!confirm('Estàs segur d\'eliminar aquesta programació?')) return

    const res = await fetch(`/api/programacions/${params.id}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      router.push('/programacions')
    } else {
      alert('Error eliminant la programació')
    }
  }

  if (status === 'loading' || !programacio) {
    return <div className="flex min-h-screen items-center justify-center"><p>Carregant...</p></div>
  }
  if (status === 'unauthenticated') return null

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-8">
        {/* Capçalera */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <Link href="/programacions" className="mb-2 inline-block text-sm text-primary hover:underline">← Tornar</Link>
            {editantProgramacio ? (
              <div>
                <input
                  type="text"
                  value={formProgramacio.titol}
                  onChange={(e) => setFormProgramacio({ ...formProgramacio, titol: e.target.value })}
                  className="mb-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-xl font-semibold text-gray-900"
                />
                <textarea
                  value={formProgramacio.descripcio}
                  onChange={(e) => setFormProgramacio({ ...formProgramacio, descripcio: e.target.value })}
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
                  placeholder="Descripció de la programació"
                />
                <select
                  value={formProgramacio.cursEscolarId}
                  onChange={(e) => setFormProgramacio({ ...formProgramacio, cursEscolarId: e.target.value })}
                  className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Curs escolar</option>
                  {cursos.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.anyInici}/{c.anyFi} {c.actiu ? '(actiu)' : ''}</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">{programacio.titol}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {programacio.nivell?.nom} · {programacio.materia?.nom} · Curs {programacio.cursEscolar?.anyInici}/{programacio.cursEscolar?.anyFi}
                </p>
                <p className="text-sm text-gray-500">Autor: {programacio.autor?.nom} · v{programacio.versio}</p>
              </>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Link
                href={`/programacions/${params.id}/calendari`}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Calendari
              </Link>
              <select
                value={formProgramacio.estat}
                onChange={(e) => setFormProgramacio({ ...formProgramacio, estat: e.target.value })}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="esborrany">Esborrany</option>
                <option value="publicat">Publicat</option>
                <option value="finalitzat">Finalitzat</option>
              </select>
              {editantProgramacio ? (
                <button
                  type="button"
                  onClick={desarProgramacio}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Desa
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditantProgramacio(true)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edita
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={eliminarProgramacio}
            >
              Eliminar programació
            </button>
          </div>
        </div>

        {/* Descripció */}
        {programacio.descripcio && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Descripció</h2>
            <p className="text-gray-600">{programacio.descripcio}</p>
          </div>
        )}

        {/* Unitats Didàctiques */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Unitats Didàctiques</h2>
            <button
              onClick={() => setNovaUnitat(true)}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              + Afegir unitat
            </button>
          </div>

          {novaUnitat && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 font-medium text-gray-700">Nova unitat</h3>
              <div className="space-y-3">
                <input
                  placeholder="Títol de la unitat"
                  value={formUnitat.titol}
                  onChange={e => setFormUnitat({...formUnitat, titol: e.target.value})}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <input
                  placeholder="Temporització (ex: 12 sessions)"
                  value={formUnitat.temporitzacio}
                  onChange={e => setFormUnitat({...formUnitat, temporitzacio: e.target.value})}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block text-sm text-gray-700">
                    Data d'inici
                    <input
                      type="date"
                      value={formUnitat.dataInici}
                      onChange={e => setFormUnitat({...formUnitat, dataInici: e.target.value})}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm text-gray-700">
                    Data de finalització
                    <input
                      type="date"
                      value={formUnitat.dataFi}
                      onChange={e => setFormUnitat({...formUnitat, dataFi: e.target.value})}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <textarea
                  placeholder="Objectius"
                  value={formUnitat.objectius}
                  onChange={e => setFormUnitat({...formUnitat, objectius: e.target.value})}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="Continguts"
                  value={formUnitat.continguts}
                  onChange={e => setFormUnitat({...formUnitat, continguts: e.target.value})}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="Criteris d'avaluació"
                  value={formUnitat.criterisAvaluacio}
                  onChange={e => setFormUnitat({...formUnitat, criterisAvaluacio: e.target.value})}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setNovaUnitat(false)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700">Cancel·lar</button>
                  <button onClick={afegirUnitat} className="rounded-md bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-dark">Guardar</button>
                </div>
              </div>
            </div>
          )}

          {programacio.unitatsDidactiques?.length === 0 ? (
            <p className="text-gray-500">No hi ha unitats didàctiques encara.</p>
          ) : (
            <div className="space-y-4">
              {programacio.unitatsDidactiques?.map((unitat) => {
                const enEdicio = editantUnitat === unitat.id
                const unitatEdit = unitatEnEdicio[unitat.id] || unitat

                return (
                  <div key={unitat.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-gray-900">U{unitat.ordre}. {unitat.titol}</h3>
                        <p className="text-sm text-gray-500">Temporització: {unitat.temporitzacio}</p>
                      </div>
                      <div className="flex gap-2">
                        {enEdicio ? (
                          <button
                            type="button"
                            onClick={() => cancel·larEdicioUnitat(unitat.id)}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Cancel·lar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => iniciarEdicioUnitat(unitat)}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edita
                          </button>
                        )}
                        <button
                          onClick={() => eliminarUnitat(unitat.id)}
                          className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                        >
                          Eliminar
                        </button>
                      </div>
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
                          placeholder="Criteris d'avaluació"
                        />
                        <button
                          type="button"
                          onClick={() => desarUnitat(unitat.id)}
                          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                        >
                          Desa canvis
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                        {unitat.temporitzacio && <p><strong>Temporització:</strong> {unitat.temporitzacio}</p>}
                        {(unitat.dataInici || unitat.dataFi) && (
                          <p>
                            {unitat.dataInici && <span><strong>Inici:</strong> {new Date(unitat.dataInici).toLocaleDateString()}</span>}
                            {unitat.dataFi && <span className="ml-4"><strong>Fi:</strong> {new Date(unitat.dataFi).toLocaleDateString()}</span>}
                          </p>
                        )}
                        {unitat.objectius && <p className="md:col-span-2"><strong>Objectius:</strong> {unitat.objectius}</p>}
                        {unitat.continguts && <p className="md:col-span-2"><strong>Continguts:</strong> {unitat.continguts}</p>}
                        {unitat.criterisAvaluacio && <p className="md:col-span-2"><strong>Criteris d'avaluació:</strong> {unitat.criterisAvaluacio}</p>}
                      </div>
                    )}

                    {/* Situacions d'Aprenentatge */}
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-medium text-gray-800">Situacions d'Aprenentatge</h4>
                        <button
                          onClick={() => obrirNovaSituacio(unitat.id)}
                          className="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
                        >
                          + Afegir SA
                        </button>
                      </div>

                      {/* Formulari nova situació */}
                      {novaSituacio[unitat.id] && (
                        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
                          <h5 className="mb-2 font-medium text-gray-700">Nova situació d'aprenentatge</h5>
                          <div className="space-y-2">
                            <input
                              placeholder="Títol de la situació"
                              value={formSituacio[unitat.id]?.titol || ''}
                              onChange={e => setFormSituacio(prev => ({
                                ...prev,
                                [unitat.id]: { ...prev[unitat.id], titol: e.target.value }
                              }))}
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                            />
                            <textarea
                              placeholder="Descripció (opcional)"
                              value={formSituacio[unitat.id]?.descripcio || ''}
                              onChange={e => setFormSituacio(prev => ({
                                ...prev,
                                [unitat.id]: { ...prev[unitat.id], descripcio: e.target.value }
                              }))}
                              rows={2}
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                            />
                            <textarea
                              placeholder="Competències específiques"
                              value={formSituacio[unitat.id]?.competenciesEspecifiques || ''}
                              onChange={e => setFormSituacio(prev => ({
                                ...prev,
                                [unitat.id]: { ...prev[unitat.id], competenciesEspecifiques: e.target.value }
                              }))}
                              rows={2}
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                            />
                            <textarea
                              placeholder="Mesures i suports universals"
                              value={formSituacio[unitat.id]?.mesuresSuportsUniversals || ''}
                              onChange={e => setFormSituacio(prev => ({
                                ...prev,
                                [unitat.id]: { ...prev[unitat.id], mesuresSuportsUniversals: e.target.value }
                              }))}
                              rows={2}
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                            />
                            <div className="grid gap-2">
                              <label className="text-xs font-medium text-green-700">
                                Activitats inicials (Què sabem?)
                                <textarea
                                  value={formSituacio[unitat.id]?.activitatsInicials || ''}
                                  onChange={e => setFormSituacio(prev => ({
                                    ...prev,
                                    [unitat.id]: { ...prev[unitat.id], activitatsInicials: e.target.value }
                                  }))}
                                  rows={2}
                                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                />
                              </label>
                              <label className="text-xs font-medium text-blue-700">
                                Activitats de desenvolupament (Aprenem nous sabers)
                                <textarea
                                  value={formSituacio[unitat.id]?.activitatsDesenvolupament || ''}
                                  onChange={e => setFormSituacio(prev => ({
                                    ...prev,
                                    [unitat.id]: { ...prev[unitat.id], activitatsDesenvolupament: e.target.value }
                                  }))}
                                  rows={2}
                                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                />
                              </label>
                              <label className="text-xs font-medium text-yellow-700">
                                Activitats d'estructuració (Què hem après?)
                                <textarea
                                  value={formSituacio[unitat.id]?.activitatsEstructuracio || ''}
                                  onChange={e => setFormSituacio(prev => ({
                                    ...prev,
                                    [unitat.id]: { ...prev[unitat.id], activitatsEstructuracio: e.target.value }
                                  }))}
                                  rows={2}
                                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                />
                              </label>
                              <label className="text-xs font-medium text-orange-700">
                                Activitats d'aplicació (Apliquem el que hem après)
                                <textarea
                                  value={formSituacio[unitat.id]?.activitatsAplicacio || ''}
                                  onChange={e => setFormSituacio(prev => ({
                                    ...prev,
                                    [unitat.id]: { ...prev[unitat.id], activitatsAplicacio: e.target.value }
                                  }))}
                                  rows={2}
                                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                />
                              </label>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button onClick={() => tancarNovaSituacio(unitat.id)} className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700">Cancel·lar</button>
                              <button onClick={() => afegirSituacio(unitat.id)} className="rounded-md bg-primary px-2 py-1 text-xs text-white hover:bg-primary-dark">Guardar</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Llista de situacions */}
                      {unitat.situacionsAprenentatge && unitat.situacionsAprenentatge.length > 0 ? (
                        <div className="space-y-3">
                          {unitat.situacionsAprenentatge.map((situacio) => {
                            const enEdicioSituacio = editantSituacio === situacio.id
                            const situacioEdit = situacioEnEdicio[situacio.id] || situacio

                            return (
                              <div key={situacio.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                {enEdicioSituacio ? (
                                  <div className="space-y-2">
                                    <input
                                      value={situacioEdit.titol}
                                      onChange={(e) => canviSituacioEnEdicio(situacio.id, 'titol', e.target.value)}
                                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm font-medium"
                                    />
                                    <textarea
                                      value={situacioEdit.descripcio || ''}
                                      onChange={(e) => canviSituacioEnEdicio(situacio.id, 'descripcio', e.target.value)}
                                      rows={2}
                                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                      placeholder="Descripció"
                                    />
                                    <textarea
                                      value={situacioEdit.competenciesEspecifiques}
                                      onChange={(e) => canviSituacioEnEdicio(situacio.id, 'competenciesEspecifiques', e.target.value)}
                                      rows={2}
                                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                      placeholder="Competències específiques"
                                    />
                                    <textarea
                                      value={situacioEdit.mesuresSuportsUniversals}
                                      onChange={(e) => canviSituacioEnEdicio(situacio.id, 'mesuresSuportsUniversals', e.target.value)}
                                      rows={2}
                                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                      placeholder="Mesures i suports universals"
                                    />
                                    <div className="grid gap-2">
                                      <label className="text-xs font-medium text-green-700">
                                        Activitats inicials (Què sabem?)
                                        <textarea
                                          value={situacioEdit.activitatsInicials}
                                          onChange={(e) => canviSituacioEnEdicio(situacio.id, 'activitatsInicials', e.target.value)}
                                          rows={2}
                                          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                        />
                                      </label>
                                      <label className="text-xs font-medium text-blue-700">
                                        Activitats de desenvolupament
                                        <textarea
                                          value={situacioEdit.activitatsDesenvolupament}
                                          onChange={(e) => canviSituacioEnEdicio(situacio.id, 'activitatsDesenvolupament', e.target.value)}
                                          rows={2}
                                          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                        />
                                      </label>
                                      <label className="text-xs font-medium text-yellow-700">
                                        Activitats d'estructuració
                                        <textarea
                                          value={situacioEdit.activitatsEstructuracio}
                                          onChange={(e) => canviSituacioEnEdicio(situacio.id, 'activitatsEstructuracio', e.target.value)}
                                          rows={2}
                                          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                        />
                                      </label>
                                      <label className="text-xs font-medium text-orange-700">
                                        Activitats d'aplicació
                                        <textarea
                                          value={situacioEdit.activitatsAplicacio}
                                          onChange={(e) => canviSituacioEnEdicio(situacio.id, 'activitatsAplicacio', e.target.value)}
                                          rows={2}
                                          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                                        />
                                      </label>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => cancel·larEdicioSituacio(situacio.id)} className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700">Cancel·lar</button>
                                      <button onClick={() => desarSituacio(situacio.id)} className="rounded-md bg-primary px-2 py-1 text-xs text-white hover:bg-primary-dark">Desa</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="mb-2 flex items-start justify-between">
                                      <h5 className="font-medium text-gray-800">{situacio.titol}</h5>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => iniciarEdicioSituacio(situacio)}
                                          className="rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-700 hover:bg-gray-50"
                                        >
                                          Edita
                                        </button>
                                        <button
                                          onClick={() => eliminarSituacio(situacio.id)}
                                          className="rounded-md border border-red-300 bg-red-50 px-2 py-0.5 text-xs text-red-700 hover:bg-red-100"
                                        >
                                          Elimina
                                        </button>
                                      </div>
                                    </div>
                                    {situacio.descripcio && <p className="text-sm text-gray-600">{situacio.descripcio}</p>}
                                    {situacio.competenciesEspecifiques && (
                                      <p className="mt-2 text-sm"><strong>Competències:</strong> {situacio.competenciesEspecifiques}</p>
                                    )}
                                    {situacio.mesuresSuportsUniversals && (
                                      <p className="mt-1 text-sm"><strong>Suports:</strong> {situacio.mesuresSuportsUniversals}</p>
                                    )}
                                    {situacio.activitatsInicials && (
                                      <p className="mt-2 text-sm text-green-700"><strong>Activitats inicials:</strong> {situacio.activitatsInicials}</p>
                                    )}
                                    {situacio.activitatsDesenvolupament && (
                                      <p className="mt-1 text-sm text-blue-700"><strong>Desenvolupament:</strong> {situacio.activitatsDesenvolupament}</p>
                                    )}
                                    {situacio.activitatsEstructuracio && (
                                      <p className="mt-1 text-sm text-yellow-700"><strong>Estructuració:</strong> {situacio.activitatsEstructuracio}</p>
                                    )}
                                    {situacio.activitatsAplicacio && (
                                      <p className="mt-1 text-sm text-orange-700"><strong>Aplicació:</strong> {situacio.activitatsAplicacio}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No hi ha situacions d'aprenentatge encara.</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Blocs i criteris d'avaluació */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Blocs i Criteris d'Avaluació</h2>
          <div className="space-y-4">
            {programacio.materia?.blocs?.map((bloc) => (
              <div key={bloc.id} className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-2 font-medium text-gray-900">{bloc.codi}: {bloc.nom}</h3>
                {bloc.criterisAvaluacio.length > 0 ? (
                  <ul className="space-y-1 text-sm text-gray-600">
                    {bloc.criterisAvaluacio.map((criteri) => (
                      <li key={criteri.id} className="ml-4 list-disc">
                        <strong>{criteri.codi}</strong>: {criteri.descripcio}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">No hi ha criteris definits</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Metodologia */}
        {programacio.metodologies?.[0] && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Metodologia</h2>
            <div className="grid gap-4 text-sm text-gray-600 md:grid-cols-3">
              <div>
                <strong>Estratègies:</strong>
                <p className="mt-1">{programacio.metodologies[0].estrategies}</p>
              </div>
              <div>
                <strong>Recursos:</strong>
                <p className="mt-1">{programacio.metodologies[0].recursos}</p>
              </div>
              <div>
                <strong>Agrupaments:</strong>
                <p className="mt-1">{programacio.metodologies[0].agrupaments}</p>
              </div>
            </div>
          </div>
        )}

        {/* Atenció a la diversitat */}
        {programacio.atencionsDiversitat?.[0] && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Atenció a la Diversitat</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <strong>Mesures generals:</strong>
                <p className="mt-1">{programacio.atencionsDiversitat[0].mesuresGenerals}</p>
              </div>
              {programacio.atencionsDiversitat[0].mesuresEspecifiques && (
                <div>
                  <strong>Mesures específiques:</strong>
                  <p className="mt-1">{programacio.atencionsDiversitat[0].mesuresEspecifiques}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}