'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

interface Programacio {
  id: string
  titol: string
  descripcio: string | null
  nivell: { id: string; nom: string }
  materia: { id: string; nom: string }
  cursEscolar: { anyInici: number; anyFi: number }
}

export default function NovaProgramacioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [nivells, setNivells] = useState<any[]>([])
  const [matèries, setMatèries] = useState<any[]>([])
  const [programacions, setProgramacions] = useState<Programacio[]>([])
  const [formData, setFormData] = useState({
    titol: '',
    descripcio: '',
    cursEscolar: '2026-2027',
    nivellId: '',
    materiaId: '',
    copiarDeId: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    fetch('/api/nivells')
      .then(res => res.json())
      .then(setNivells)
    fetch('/api/programacions')
      .then(res => res.json())
      .then(setProgramacions)
  }, [])

  // Quan es selecciona una programació per copiar
  useEffect(() => {
    if (formData.copiarDeId) {
      const prog = programacions.find(p => p.id === formData.copiarDeId)
      if (prog) {
        setFormData(prev => ({
          ...prev,
          titol: prog.titol,
          nivellId: prog.nivell.id,
          materiaId: prog.materia.id,
        }))
        // Carregar matèries del nivell
        setMatèries(prog.nivell.id ? nivells.find(n => n.id === prog.nivell.id)?.matèries || [] : [])
      }
    }
  }, [formData.copiarDeId, programacions, nivells])

  const nivellSelected = (id: string) => {
    const nivell = nivells.find(n => n.id === id)
    setFormData({ ...formData, nivellId: id, materiaId: '' })
    setMatèries(nivell?.matèries || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.cursEscolar) return
    setSaving(true)

    // Parsejar el curs escolar (format: "2026-2027")
    const [anyInici, anyFi] = formData.cursEscolar.split('-').map(Number)
    if (!anyInici || !anyFi) {
      alert('Format de curs no vàlid. Usa: 2026-2027')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/programacions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          anyInici,
          anyFi,
        }),
      })

      if (res.ok) {
        const prog = await res.json()
        router.push(`/programacions/${prog.id}`)
      } else {
        alert('Error en crear la programació')
      }
    } catch {
      alert('Error en crear la programació')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') return <div className="flex min-h-screen items-center justify-center"><p>Carregant...</p></div>
  if (status === 'unauthenticated') return null

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Nova Programació</h1>
          <p className="mt-1 text-gray-500">Crea una nova programació didàctica</p>
        </div>

        <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selector de programació origen */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Copiar des de (opcional)
              </label>
              <select
                value={formData.copiarDeId}
                onChange={(e) => {
                  setFormData({ ...formData, copiarDeId: e.target.value, titol: '', nivellId: '', materiaId: '' })
                  setMatèries([])
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- No copiar --</option>
                {programacions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titol} ({p.nivell.nom} · {p.materia.nom})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Si selecciones una programació, s'omplirà automàticament amb la seva estructura
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Títol de la programació</label>
              <input
                type="text"
                value={formData.titol}
                onChange={(e) => setFormData({ ...formData, titol: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Programació de Matemàtiques - 1r ESO"
                required
                readOnly={!!formData.copiarDeId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Descripció</label>
              <textarea
                value={formData.descripcio}
                onChange={(e) => setFormData({ ...formData, descripcio: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Descripció opcional de la programació"
                readOnly={!!formData.copiarDeId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Curs escolar</label>
              <input
                type="text"
                value={formData.cursEscolar}
                onChange={(e) => setFormData({ ...formData, cursEscolar: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="2026-2027"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Escriu els anys en format: anyInici-anyFi (ex: 2026-2027)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nivell</label>
              <select
                value={formData.nivellId}
                onChange={(e) => nivellSelected(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
                disabled={!!formData.copiarDeId}
              >
                <option value="">Selecciona un nivell</option>
                {nivells.map((n: any) => (
                  <option key={n.id} value={n.id}>{n.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Matèria</label>
              <select
                value={formData.materiaId}
                onChange={(e) => setFormData({ ...formData, materiaId: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
                disabled={!formData.nivellId || !!formData.copiarDeId}
              >
                <option value="">Selecciona una matèria</option>
                {matèries.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.nom}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {saving ? 'Creant...' : 'Crear programació'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}