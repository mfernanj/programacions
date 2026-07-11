'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardStats {
  totalProgramacions: number
  totalUnitats: number
  totalExamens: number
  usuaris: number
  programacionsRecents: Array<{
    id: string
    titol: string
    nivell: { nom: string }
    materia: { nom: string }
    estat: string
    updatedAt: string
    autor: { nom: string }
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/programacions')
        const programacions = await res.json()
        setStats({
          totalProgramacions: programacions.length,
          totalUnitats: programacions.reduce((acc: number, p: any) => acc + (p._count?.unitatsDidactiques || 0), 0),
          totalExamens: 0,
          usuaris: 1,
          programacionsRecents: programacions.slice(0, 5),
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [])

  if (status === 'loading' || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg text-gray-600">Carregant...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Benvingut/da, {session?.user?.name || 'Usuari'}
        </h1>
        <p className="mt-1 text-gray-500">
          Panel de control del Gestor de Programacions Didàctiques
        </p>
      </div>

      {/* Targetes de resum */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Programacions</p>
              <p className="text-2xl font-bold">{stats.totalProgramacions}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Unitats Didàctiques</p>
              <p className="text-2xl font-bold">{stats.totalUnitats}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 p-3">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Exàmens</p>
              <p className="text-2xl font-bold">{stats.totalExamens}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-3">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Usuaris</p>
              <p className="text-2xl font-bold">{stats.usuaris}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accions ràpides */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Accions ràpides</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/programacions/nova"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            + Nova programació
          </Link>
          <Link
            href="/examens/nou"
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            + Pujar examen
          </Link>
          <Link
            href="/usuaris/nou"
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            + Afegir usuari
          </Link>
        </div>
      </div>

      {/* Programacions recents */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Programacions recents</h2>
        {stats.programacionsRecents.length === 0 ? (
          <p className="text-gray-500">No hi ha programacions encara.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-3 pr-4 font-medium">Títol</th>
                  <th className="pb-3 pr-4 font-medium">Curs</th>
                  <th className="pb-3 pr-4 font-medium">Matèria</th>
                  <th className="pb-3 pr-4 font-medium">Estat</th>
                  <th className="pb-3 font-medium">Autor</th>
                </tr>
              </thead>
              <tbody>
                {stats.programacionsRecents.map((prog) => (
                  <tr key={prog.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <Link href={`/programacions/${prog.id}`} className="text-primary hover:underline">
                        {prog.titol}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{prog.nivell?.nom}</td>
                    <td className="py-3 pr-4">{prog.materia?.nom}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        prog.estat === 'esborrany' ? 'bg-yellow-100 text-yellow-800' :
                        prog.estat === 'publicat' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {prog.estat}
                      </span>
                    </td>
                    <td className="py-3">{prog.autor?.nom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}