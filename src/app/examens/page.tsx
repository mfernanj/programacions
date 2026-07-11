'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

interface Examen {
  id: string
  titol: string
  descripcio: string | null
  avaluacio: string
  tipus: string
  dificultat: string
  etiquetes: string | null
  nivell: { nom: string }
  materia: { nom: string }
  cursEscolar: { anyInici: number; anyFi: number }
  autor: { nom: string }
}

export default function ExamensPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [examens, setExamens] = useState<Examen[]>([])
  const [nivells, setNivells] = useState<any[]>([])
  const [materies, setMateries] = useState<any[]>([])
  const [filtreNivell, setFiltreNivell] = useState('')
  const [filtreMateria, setFiltreMateria] = useState('')
  const [filtreAvaluacio, setFiltreAvaluacio] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [cursos, setCursos] = useState<any[]>([])
  const [formData, setFormData] = useState({
    titol: '', descripcio: '', cursEscolarId: '', nivellId: '', materiaId: '',
    avaluacio: '1a', tipus: 'examen', dificultat: 'mitja', etiquetes: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    fetch('/api/nivells').then(r => r.json()).then(setNivells)
    fetch('/api/cursos').then(r => r.json()).then(setCursos)
  }, [])

  const carregarExamens = () => {
    const params = new URLSearchParams()
    if (filtreNivell) params.set('nivellId', filtreNivell)
    if (filtreMateria) params.set('materiaId', filtreMateria)
    if (filtreAvaluacio) params.set('avaluacio', filtreAvaluacio)
    fetch(`/api/examens?${params}`).then(r => r.json()).then(setExamens)
  }

  useEffect(() => { carregarExamens() }, [filtreNivell, filtreMateria, filtreAvaluacio])

  const nivellSelected = (id: string) => {
    setFormData({ ...formData, nivellId: id, materiaId: '' })
    const nivell = nivells.find(n => n.id === id)
    setMateries(nivell?.matèries || [])
    setFiltreNivell(id)
  }

  // Seleccionar curs actiu per defecte
  useEffect(() => {
    if (cursos.length > 0 && !formData.cursEscolarId) {
      const actiu = cursos.find(c => c.actiu)
      setFormData(prev => ({ ...prev, cursEscolarId: actiu ? actiu.id : cursos[0].id }))
    }
  }, [cursos])

  const crearExamen = async () => {
    if (!formData.cursEscolarId) return
    const res = await fetch('/api/examens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (res.ok) {
      setShowForm(false)
      setFormData({ titol: '', descripcio: '', cursEscolarId: '', nivellId: '', materiaId: '', avaluacio: '1a', tipus: 'examen', dificultat: 'mitja', etiquetes: '' })
      carregarExamens()
    }
  }

  const eliminarExamen = async (id: string) => {
    if (confirm('Estàs segur?')) {
      await fetch(`/api/examens?id=${id}`, { method: 'DELETE' })
      carregarExamens()
    }
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
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            + Nou examen
          </button>
        </div>

        {showForm && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold">Nou examen</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <input placeholder="Títol" value={formData.titol} onChange={e => setFormData({...formData, titol: e.target.value})} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
              <input placeholder="Descripció" value={formData.descripcio} onChange={e => setFormData({...formData, descripcio: e.target.value})} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
              <select value={formData.cursEscolarId} onChange={e => setFormData({...formData, cursEscolarId: e.target.value})} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="">Curs escolar</option>
                {cursos.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.anyInici}/{c.anyFi} {c.actiu ? '(actiu)' : ''}</option>
                ))}
              </select>
              <select value={formData.nivellId} onChange={e => nivellSelected(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="">Nivell</option>
                {nivells.map((n: any) => <option key={n.id} value={n.id}>{n.nom}</option>)}
              </select>
              <select value={formData.materiaId} onChange={e => setFormData({...formData, materiaId: e.target.value})} className="rounded-md border border-gray-300 px-3 py-2 text-sm" disabled={!formData.nivellId}>
                <option value="">Matèria</option>
                {materies.map((m: any) => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
              <select value={formData.avaluacio} onChange={e => setFormData({...formData, avaluacio: e.target.value})} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
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
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">Cancel·lar</button>
              <button onClick={crearExamen} className="rounded-md bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-dark">Guardar</button>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-3">
          <select value={filtreNivell} onChange={e => { setFiltreNivell(e.target.value); setFiltreMateria('') }} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">Tots els nivells</option>
            {nivells.map((n: any) => <option key={n.id} value={n.id}>{n.nom}</option>)}
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
                  <button onClick={() => eliminarExamen(examen.id)} className="text-xs text-red-500 hover:text-red-700">✕</button>
                </div>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>{examen.nivell?.nom} · {examen.materia?.nom}</p>
                  <p>{examen.avaluacio === 'Extraordinaria' ? 'Extraordinària' : `${examen.avaluacio} Avaluació`}</p>
                  <p>{examen.tipus} · {examen.dificultat}</p>
                  <p className="text-xs">Curs {examen.cursEscolar?.anyInici}/{examen.cursEscolar?.anyFi}</p>
                  {examen.etiquetes && <p className="text-xs text-primary">{examen.etiquetes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}