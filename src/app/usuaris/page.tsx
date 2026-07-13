'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

type Usuari = { id: string; nom: string; email: string; rol: string; createdAt: string }

export default function UsuarisPage() {
  const { status } = useSession()
  const router = useRouter()
  const [usuaris, setUsuaris] = useState<Usuari[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nom: '', email: '', password: '', rol: 'membre' })
  const carregar = () => fetch('/api/usuaris').then(async (res) => {
    if (!res.ok) throw new Error((await res.json()).error || 'No autoritzat')
    return res.json()
  }).then(setUsuaris).catch((err: Error) => setError(err.message))

  useEffect(() => { if (status === 'unauthenticated') router.replace('/') }, [status, router])
  useEffect(() => { if (status === 'authenticated') carregar() }, [status])
  const desar = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError('')
    const res = await fetch('/api/usuaris', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    if (!res.ok) { setError((await res.json()).error || 'No s’ha pogut crear l’usuari'); return }
    setForm({ nom: '', email: '', password: '', rol: 'membre' }); carregar()
  }

  if (status !== 'authenticated') return <div className="flex min-h-screen items-center justify-center">Carregant...</div>
  return <div className="flex"><Sidebar /><main className="flex-1 bg-gray-50 p-8">
    <h1 className="text-2xl font-bold text-gray-900">Usuaris</h1>
    <p className="mt-1 text-gray-500">Només l’administració pot donar d’alta membres.</p>
    <form onSubmit={desar} className="mt-6 grid gap-3 rounded-lg bg-white p-6 shadow-sm md:grid-cols-4">
      <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Nom" className="rounded border p-2" />
      <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Correu" className="rounded border p-2" />
      <input required minLength={10} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Contrasenya (10+)" className="rounded border p-2" />
      <div className="flex gap-2"><select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} className="rounded border p-2"><option value="membre">Membre</option><option value="admin">Administrador</option></select><button disabled={saving} className="rounded bg-primary px-4 text-white disabled:opacity-50">{saving ? 'Desant...' : 'Afegir'}</button></div>
    </form>
    {error ? <p className="mt-4 text-red-700">{error}</p> : null}
    <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="p-3">Nom</th><th className="p-3">Correu</th><th className="p-3">Rol</th></tr></thead><tbody>{usuaris.map((usuari) => <tr key={usuari.id} className="border-t"><td className="p-3">{usuari.nom}</td><td className="p-3">{usuari.email}</td><td className="p-3">{usuari.rol}</td></tr>)}</tbody></table></div>
  </main></div>
}
