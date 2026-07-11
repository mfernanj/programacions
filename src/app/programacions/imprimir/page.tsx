'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

interface ProgramacioRef {
  id: string
  titol: string
  estat: string
  versio: number
  descripcio: string | null
  nivell: { nom: string }
  materia: { nom: string }
  cursEscolar: { anyInici: number; anyFi: number }
  autor?: { nom: string }
  unitatsDidactiques?: UnitatDidactica[]
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
  ordre: number
}

export default function ImprimirProgramacioPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [programacions, setProgramacions] = useState<ProgramacioRef[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [programacio, setProgramacio] = useState<ProgramacioRef | null>(null)
  const [unitats, setUnitats] = useState<UnitatDidactica[]>([])
  const [carregant, setCarregant] = useState(false)
  const [nomCentre, setNomCentre] = useState(process.env.NEXT_PUBLIC_NOM_CENTRE || 'Centre Educatiu')
  const [nomCentreEnEdicio, setNomCentreEnEdicio] = useState(process.env.NEXT_PUBLIC_NOM_CENTRE || 'Centre Educatiu')
  const [guardantNomCentre, setGuardantNomCentre] = useState(false)
  const [guardatCorrecte, setGuardatCorrecte] = useState(false)
  const [errorNomCentre, setErrorNomCentre] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    const carregar = async () => {
      const res = await fetch('/api/programacions')
      const data = await res.json()
      setProgramacions(data)
    }

    const carregarConfiguracio = async () => {
      const res = await fetch('/api/configuracio', { credentials: 'include', cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setNomCentre(data.nomCentre || 'Centre Educatiu')
        setNomCentreEnEdicio(data.nomCentre || 'Centre Educatiu')
      } else {
        const data = await res.json().catch(() => null)
        setErrorNomCentre(data?.error || 'No s’ha pogut carregar el nom del centre.')
      }
    }

    carregar()
    carregarConfiguracio()
  }, [])

  useEffect(() => {
    const carregarProgramacio = async () => {
      if (!selectedId) {
        setProgramacio(null)
        setUnitats([])
        return
      }

      setCarregant(true)
      const res = await fetch(`/api/programacions/${selectedId}`)
      if (res.ok) {
        const data = await res.json()
        setProgramacio(data)
        setUnitats(data.unitatsDidactiques || [])
      } else {
        setProgramacio(null)
        setUnitats([])
      }
      setCarregant(false)
    }

    carregarProgramacio()
  }, [selectedId])

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return dateString
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSaveNomCentre = async () => {
    if (!nomCentreEnEdicio.trim()) return
    setGuardantNomCentre(true)
    setErrorNomCentre(null)

    try {
      const res = await fetch('/api/configuracio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ nomCentre: nomCentreEnEdicio.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setErrorNomCentre(data?.error || 'No s’ha pogut desar el nom del centre.')
      } else {
        const data = await res.json()
        const centre = data.nomCentre || 'Centre Educatiu'
        setNomCentre(centre)
        setNomCentreEnEdicio(centre)
        setGuardatCorrecte(true)
        setTimeout(() => setGuardatCorrecte(false), 2000)
      }
    } catch (error) {
      setErrorNomCentre('Error de connexió. Torna-ho a provar.')
    } finally {
      setGuardantNomCentre(false)
    }
  }

  const programacioOptions = programacions.map((prog) => (
    <option key={prog.id} value={prog.id}>
      {prog.titol} · {prog.nivell.nom} · {prog.materia.nom}
    </option>
  ))

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center"><p>Carregant...</p></div>
  }

  if (status === 'unauthenticated') return null

  return (
    <div className="flex">
      <div className="no-print">
        <Sidebar />
      </div>
      <main className="flex-1 bg-gray-50 p-8">
        <style jsx global>{`
          .no-print { display: block !important; }
          .print-controls { display: block !important; }

          @media print {
            body { background: white !important; color: #000 !important; }
            .no-print, .print-controls { display: none !important; }
            main { padding: 0 !important; background: white !important; }
            .print-page { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; }
            .print-page * { color: #000 !important; background: transparent !important; }
            .print-page .rounded-xl, .print-page .rounded-2xl, .print-page .shadow-sm, .print-page .shadow-md, .print-page .border, .print-page .border-gray-200, .print-page .bg-gray-50, .print-page .bg-white {
              background: transparent !important;
              box-shadow: none !important;
              border: none !important;
            }
            .print-page header, .print-page section, .print-page article {
              page-break-inside: avoid !important;
            }
          }
        `}</style>
        <div className="print-controls mb-8 flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Imprimir programació</h1>
            <p className="mt-1 text-gray-500">Selecciona una programació per generar un PDF de la programació i les seues unitats.</p>
          </div>

          <div className="grid gap-4 rounded-xl bg-white p-6 shadow-sm">
            <label className="text-sm font-medium text-gray-700">Nom del centre</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <input
                type="text"
                value={nomCentreEnEdicio}
                onChange={(e) => setNomCentreEnEdicio(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleSaveNomCentre}
                disabled={!nomCentreEnEdicio.trim() || guardantNomCentre}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {guardantNomCentre ? 'Guardant...' : 'Desar nom del centre'}
              </button>
            </div>
            {guardatCorrecte ? <p className="text-sm text-success">Nom guardat correctament.</p> : null}
            {errorNomCentre ? <p className="text-sm text-danger">{errorNomCentre}</p> : null}
          </div>

          <div className="grid gap-4 rounded-xl bg-white p-6 shadow-sm">
            <label className="text-sm font-medium text-gray-700">Programació</label>
            <select
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Selecciona una programació...</option>
              {programacioOptions}
            </select>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                disabled={!selectedId || carregant}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Imprimir PDF
              </button>
              <Link href="/programacions" className="text-sm text-primary hover:underline">
                ← Tornar a programacions
              </Link>
            </div>
          </div>
        </div>

        <div className="print-page rounded-xl bg-white p-8 shadow-sm">
          {selectedId === '' ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
              Selecciona una programació per veure la vista d'impressió.
            </div>
          ) : carregant ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">Carregant programació...</div>
          ) : programacio ? (
            <div className="space-y-10">
              <header className="space-y-4 border-b border-gray-200 pb-6">
                <div className="space-y-1 text-sm text-gray-500">
                  <p className="font-semibold text-primary">{nomCentre}</p>
                  <p>Impressió de la Programació Didàctica</p>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{programacio.titol}</h2>
                  <p className="mt-2 text-base text-gray-700">
                    {programacio.nivell.nom} · {programacio.materia.nom} · Curs {programacio.cursEscolar.anyInici}/{programacio.cursEscolar.anyFi}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Autor: {programacio.autor?.nom || 'Desconegut'} · Estat: {programacio.estat} · Versió {programacio.versio}
                  </p>
                </div>
              </header>

              {programacio.descripcio ? (
                <section className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">Descripció</h3>
                  <p className="text-gray-700 whitespace-pre-line">{programacio.descripcio}</p>
                </section>
              ) : null}

              <section className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm uppercase tracking-wide text-gray-500">Dades de la programació</p>
                  <dl className="mt-3 grid gap-3 md:grid-cols-3">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-500">Curs escolar</dt>
                      <dd className="mt-1 text-sm text-gray-700">{programacio.cursEscolar.anyInici}/{programacio.cursEscolar.anyFi}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-500">Nivell</dt>
                      <dd className="mt-1 text-sm text-gray-700">{programacio.nivell.nom}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-500">Matèria</dt>
                      <dd className="mt-1 text-sm text-gray-700">{programacio.materia.nom}</dd>
                    </div>
                  </dl>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-900">Unitats didàctiques</h3>
                  {unitats.length === 0 ? (
                    <p className="text-gray-500">Aquesta programació no té unitats associades.</p>
                  ) : (
                    unitats.map((unitat) => (
                      <article key={unitat.id} className="rounded-2xl border border-gray-200 p-6">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-primary">Unitat {unitat.ordre}</p>
                            <h4 className="mt-2 text-xl font-semibold text-gray-900">{unitat.titol}</h4>
                          </div>
                          <p className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-600">{unitat.temporitzacio}</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Objectius</p>
                            <p className="mt-2 text-sm leading-6 text-gray-700 whitespace-pre-line">{unitat.objectius}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Continguts</p>
                            <p className="mt-2 text-sm leading-6 text-gray-700 whitespace-pre-line">{unitat.continguts}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Criteris d’avaluació</p>
                            <p className="mt-2 text-sm leading-6 text-gray-700 whitespace-pre-line">{unitat.criterisAvaluacio || 'No especificat'}</p>
                          </div>
                        </div>
                        {(unitat.dataInici || unitat.dataFi) ? (
                          <div className="mt-4 text-sm text-gray-500">
                            <p>{unitat.dataInici ? `Inici: ${formatDate(unitat.dataInici)}` : null}</p>
                            <p>{unitat.dataFi ? `Fi: ${formatDate(unitat.dataFi)}` : null}</p>
                          </div>
                        ) : null}
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">No s'ha pogut carregar aquesta programació.</div>
          )}
        </div>
      </main>
    </div>
  )
}
