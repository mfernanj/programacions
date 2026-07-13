'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import type { CursEscolar, Materia, Nivell } from '@/types/domain'

interface Examen {
  id: string
  titol: string
  descripcio: string | null
  avaluacio: string
  tipus: string
  dificultat: string
  etiquetes: string | null
  fitxerPath: string | null
  cursEscolarId: string
  nivellId: string
  materiaId: string
  nivell: { nom: string }
  materia: { nom: string }
  cursEscolar: { anyInici: number; anyFi: number }
  autor: { nom: string }
}

export default function ExamensPage() {
  const { status } = useSession()
  const router = useRouter()
  const [examens, setExamens] = useState<Examen[]>([])
  const [nivells, setNivells] = useState<Nivell[]>([])
  const [materies, setMateries] = useState<Materia[]>([])
  const [filtreNivell, setFiltreNivell] = useState('')
  const [filtreMateria, setFiltreMateria] = useState('')
  const [filtreAvaluacio, setFiltreAvaluacio] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [cursos, setCursos] = useState<CursEscolar[]>([])
  const [editantId, setEditantId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    titol: '', descripcio: '', cursEscolarId: '', nivellId: '', materiaId: '',
    avaluacio: '1a', tipus: 'examen', dificultat: 'mitja', etiquetes: '', fitxerPath: '',
  })
  const [fitxer, setFitxer] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    fetch('/api/nivells').then((res) => res.json()).then(setNivells)
    fetch('/api/cursos').then((res) => res.json()).then((data: CursEscolar[]) => {
      setCursos(data)
      const actiu = data.find((curs) => curs.actiu)
      if (actiu) setFormData((previous) => ({ ...previous, cursEscolarId: previous.cursEscolarId || actiu.id }))
    })
  }, [])

  const carregarExamens = () => {
    const params = new URLSearchParams()
    if (filtreNivell) params.set('nivellId', filtreNivell)
    if (filtreMateria) params.set('materiaId', filtreMateria)
    if (filtreAvaluacio) params.set('avaluacio', filtreAvaluacio)
    fetch(`/api/examens?${params}`).then(r => r.json()).then(setExamens)
  }

  useEffect(() => {
    const params = new URLSearchParams()
    if (filtreNivell) params.set('nivellId', filtreNivell)
    if (filtreMateria) params.set('materiaId', filtreMateria)
    if (filtreAvaluacio) params.set('avaluacio', filtreAvaluacio)
    fetch(`/api/examens?${params}`).then((res) => res.json()).then(setExamens)
  }, [filtreNivell, filtreMateria, filtreAvaluacio])

  const nivellSelected = (id: string) => {
    setFormData({ ...formData, nivellId: id, materiaId: '' })
    const nivell = nivells.find((nivell) => nivell.id === id)
    setMateries(nivell?.matèries || [])
    setFiltreNivell(id)
  }

  const resetForm = () => {
    setFormData({ titol: '', descripcio: '', cursEscolarId: '', nivellId: '', materiaId: '', avaluacio: '1a', tipus: 'examen', dificultat: 'mitja', etiquetes: '', fitxerPath: '' })
    setFitxer(null)
    setEditantId(null)
    setShowForm(false)
  }

  const crearExamen = async () => {
    if (!formData.cursEscolarId) return
    
    // Validació: o fitxer o fitxerPath és obligatori
    if (!fitxer && !formData.fitxerPath) {
      alert('Cal pujar un arxiu o indicar una ruta')
      return
    }
    
    setSaving(true)
    
    const form = new FormData()
    form.append('titol', formData.titol)
    form.append('descripcio', formData.descripcio)
    form.append('cursEscolarId', formData.cursEscolarId)
    form.append('nivellId', formData.nivellId)
    form.append('materiaId', formData.materiaId)
    form.append('avaluacio', formData.avaluacio)
    form.append('tipus', formData.tipus)
    form.append('dificultat', formData.dificultat)
    form.append('etiquetes', formData.etiquetes)
    if (fitxer) form.append('fitxer', fitxer)
    if (formData.fitxerPath) form.append('fitxerPath', formData.fitxerPath)

    const res = await fetch('/api/examens', {
      method: 'POST',
      body: form,
    })
    
    setSaving(false)
    
    if (res.ok) {
      resetForm()
      carregarExamens()
    } else {
      const error = await res.json()
      alert(error.error || 'Error en crear l\'examen')
    }
  }

  const actualitzarExamen = async () => {
    if (!editantId) return
    
    setSaving(true)
    
    const form = new FormData()
    form.append('titol', formData.titol)
    form.append('descripcio', formData.descripcio)
    form.append('cursEscolarId', formData.cursEscolarId)
    form.append('nivellId', formData.nivellId)
    form.append('materiaId', formData.materiaId)
    form.append('avaluacio', formData.avaluacio)
    form.append('tipus', formData.tipus)
    form.append('dificultat', formData.dificultat)
    form.append('etiquetes', formData.etiquetes)
    if (fitxer) form.append('fitxer', fitxer)
    if (formData.fitxerPath) form.append('fitxerPath', formData.fitxerPath)

    const res = await fetch(`/api/examens/${editantId}`, {
      method: 'PUT',
      body: form,
    })
    
    setSaving(false)
    
    if (res.ok) {
      resetForm()
      carregarExamens()
    } else {
      const error = await res.json()
      alert(error.error || 'Error en actualitzar l\'examen')
    }
  }

  const eliminarExamen = async (id: string) => {
    if (confirm('Estàs segur?')) {
      await fetch(`/api/examens?id=${id}`, { method: 'DELETE' })
      carregarExamens()
    }
  }

  const editarExamen = (examen: Examen) => {
    setEditantId(examen.id)
    setFormData({
      titol: examen.titol,
      descripcio: examen.descripcio || '',
      cursEscolarId: examen.cursEscolarId || '',
      nivellId: examen.nivellId || '',
      materiaId: examen.materiaId || '',
      avaluacio: examen.avaluacio,
      tipus: examen.tipus,
      dificultat: examen.dificultat,
      etiquetes: examen.etiquetes || '',
      fitxerPath: examen.fitxerPath || '',
    })
    // Carregar matèries del nivell
    const nivell = nivells.find((nivell) => nivell.id === examen.nivellId)
    if (nivell) setMateries(nivell.matèries || [])
    setShowForm(true)
  }

  if (status === 'loading') return <div className="flex min-h-screen items-center justify-center"><p>Carregant...</p></div>
  if (status === 'unauthenticated') return null

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Repositori d'Exàmens</h1>
            <p className="mt-1 text-gray-500">Gestiona els exàmens del departament</p>
          </div>
          <button
            onClick={() => {
              if (showForm && !editantId) {
                resetForm()
              } else {
                setShowForm(true)
              }
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            + Nou examen
          </button>
        </div>

        {showForm && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold">
              {editantId ? 'Editar examen' : 'Nou examen'}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <input placeholder="Títol" value={formData.titol} onChange={e => setFormData({...formData, titol: e.target.value})} className="rounded-md border border-gray-300 px-3 py-2 text-sm" required />
              <input placeholder="Descripció" value={formData.descripcio} onChange={e => setFormData({...formData, descripcio: e.target.value})} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
              <select value={formData.cursEscolarId} onChange={e => setFormData({...formData, cursEscolarId: e.target.value})} className="rounded-md border border-gray-300 px-3 py-2 text-sm" required>
                <option value="">Curs escolar</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>{c.anyInici}/{c.anyFi} {c.actiu ? '(actiu)' : ''}</option>
                ))}
              </select>
              <select value={formData.nivellId} onChange={e => nivellSelected(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm" required>
                <option value="">Nivell</option>
                {nivells.map((n) => <option key={n.id} value={n.id}>{n.nom}</option>)}
              </select>
              <select value={formData.materiaId} onChange={e => setFormData({...formData, materiaId: e.target.value})} className="rounded-md border border-gray-300 px-3 py-2 text-sm" disabled={!formData.nivellId} required>
                <option value="">Matèria</option>
                {materies.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
              <select value={formData.avaluacio} onChange={e => setFormData({...formData, avaluacio: e.target.value})} className="rounded-md border border-gray-300 px-3 py-2 text-sm" required>
                <option value="1a">1a Avaluació</option>
                <option value="2a">2a Avaluació</option>
                <option value="3a">3a Avaluació</option>
                <option value="Extraordinaria">Extraordinària</option>
              </select>
              <select value={formData.tipus} onChange={e => setFormData({...formData, tipus: e.target.value})} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="examen">Examen</option>
                <option value="recuperacio">Recuperació</option>
                <option value="global">Global</option>
              </select>
              <select value={formData.dificultat} onChange={e => setFormData({...formData, dificultat: e.target.value})} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="facil">Fàcil</option>
                <option value="mitja">Mitja</option>
                <option value="dificil">Difícil</option>
              </select>
              <input placeholder="Etiquetes (ex: T1, Àlgebra)" value={formData.etiquetes} onChange={e => setFormData({...formData, etiquetes: e.target.value})} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
              
              {/* Pujar arxiu */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Arxiu d'examen (PDF)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    setFitxer(f || null)
                    if (f) setFormData({...formData, fitxerPath: ''})
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary-dark"
                />
                <p className="mt-1 text-xs text-gray-500">Opcional: indica una ruta si no pujes arxiu</p>
              </div>
              
              {/* Ruta alternativa */}
              <input 
                placeholder="Ruta externa (ex: https://...)" 
                value={formData.fitxerPath} 
                onChange={e => {
                  setFormData({...formData, fitxerPath: e.target.value})
                  if (e.target.value) setFitxer(null)
                }} 
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm md:col-span-2" 
                disabled={!!fitxer}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={resetForm} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">Cancel·lar</button>
              <button onClick={editantId ? actualitzarExamen : crearExamen} disabled={saving} className="rounded-md bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-dark disabled:opacity-50">
                {saving ? 'Guardant...' : editantId ? 'Actualitzar' : 'Guardar'}
              </button>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-3">
          <select value={filtreNivell} onChange={e => { setFiltreNivell(e.target.value); setFiltreMateria('') }} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">Tots els nivells</option>
            {nivells.map((n) => <option key={n.id} value={n.id}>{n.nom}</option>)}
          </select>
          <select value={filtreAvaluacio} onChange={e => setFiltreAvaluacio(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">Totes les avaluacions</option>
            <option value="1a">1a</option>
            <option value="2a">2a</option>
            <option value="3a">3a</option>
            <option value="Extraordinaria">Extraordinària</option>
          </select>
        </div>

        {/* Llista d'exàmens */}
        {examens.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-md">
            <p className="text-lg text-gray-500">No hi ha exàmens al repositori.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {examens.map((examen) => (
              <div key={examen.id} className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">{examen.titol}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => editarExamen(examen)} 
                      className="text-xs text-blue-500 hover:text-blue-700"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => eliminarExamen(examen.id)} 
                      className="text-xs text-red-500 hover:text-red-700"
                      title="Esborrar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>{examen.nivell?.nom} · {examen.materia?.nom}</p>
                  <p>{examen.avaluacio === 'Extraordinaria' ? 'Extraordinària' : `${examen.avaluacio} Avaluació`}</p>
                  <p>{examen.tipus} · {examen.dificultat}</p>
                  <p className="text-xs">Curs {examen.cursEscolar?.anyInici}/{examen.cursEscolar?.anyFi}</p>
                  {examen.etiquetes && <p className="text-xs text-primary">{examen.etiquetes}</p>}
                  {examen.fitxerPath && (
                    <a 
                      href={examen.fitxerPath.startsWith('http') ? examen.fitxerPath : examen.fitxerPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-blue-600 hover:underline"
                    >
                      📄 Descarrega examen
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
