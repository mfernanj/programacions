'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function NovaProgramacioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cursos, setCursos] = useState<any[]>([])
  const [nivells, setNivells] = useState<any[]>([])
  const [matèries, setMatèries] = useState<any[]>([])
  const [formData, setFormData] = useState({
    titol: '',
    descripcio: '',
    cursEscolarId: '',
    nivellId: '',
    materiaId: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    fetch('/api/cursos')
      .then(res => res.json())
      .then(setCursos)
    fetch('/api/nivells')
      .then(res => res.json())
      .then(setNivells)
  }, [])

  // Seleccionar el curs actiu per defecte
  useEffect(() => {
    if (cursos.length > 0 && !formData.cursEscolarId) {
      const actiu = cursos.find(c => c.actiu)
      if (actiu) {
        setFormData(prev => ({ ...prev, cursEscolarId: actiu.id }))
      } else {
        setFormData(prev => ({ ...prev, cursEscolarId: cursos[0].id }))
      }
    }
  }, [cursos])

  const nivellSelected = (id: string) => {
    const nivell = nivells.find(n => n.id === id)
    setFormData({ ...formData, nivellId: id, materiaId: '' })
    setMatèries(nivell?.matèries || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.cursEscolarId) return
    setSaving(true)

    try {
      const res = await fetch('/api/programacions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Títol de la programació</label>
              <input
                type="text"
                value={formData.titol}
                onChange={(e) => setFormData({ ...formData, titol: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Programació de Matemàtiques - 1r ESO"
                required
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Curs escolar</label>
              <select
                value={formData.cursEscolarId}
                onChange={(e) => setFormData({ ...formData, cursEscolarId: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Selecciona un curs</option>
                {cursos.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.anyInici}/{c.anyFi} {c.actiu ? '(actiu)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nivell</label>
              <select
                value={formData.nivellId}
                onChange={(e) => nivellSelected(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
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
                disabled={!formData.nivellId}
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