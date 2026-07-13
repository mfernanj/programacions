'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

type Plantilla = { id: string; nom: string; descripcio: string | null; estructuraJSON: string }

export default function PlantillesPage() {
  const { status } = useSession()
  const router = useRouter()
  const [plantilles, setPlantilles] = useState<Plantilla[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/')
  }, [status, router])
  useEffect(() => {
    fetch('/api/plantilles').then(async (res) => {
      if (!res.ok) throw new Error('No s’han pogut carregar les plantilles')
      return res.json()
    }).then(setPlantilles).catch((err: Error) => setError(err.message))
  }, [])

  if (status !== 'authenticated') return <div className="flex min-h-screen items-center justify-center">Carregant...</div>

  return <div className="flex"><Sidebar /><main className="flex-1 bg-gray-50 p-8">
    <h1 className="text-2xl font-bold text-gray-900">Plantilles</h1>
    <p className="mt-1 text-gray-500">Estructures disponibles per estandarditzar les programacions.</p>
    {error ? <p className="mt-6 text-red-700">{error}</p> : <div className="mt-6 grid gap-4 md:grid-cols-2">
      {plantilles.map((plantilla) => <article key={plantilla.id} className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">{plantilla.nom}</h2>
        <p className="mt-2 text-sm text-gray-600">{plantilla.descripcio || 'Sense descripció.'}</p>
        <p className="mt-4 text-xs text-gray-500">{Object.keys(JSON.parse(plantilla.estructuraJSON)).length} camps d’estructura</p>
      </article>)}
    </div>}
  </main></div>
}
