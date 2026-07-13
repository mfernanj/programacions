import { NextResponse } from 'next/server'
import { hash } from 'bcrypt-ts'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'

async function requireAdmin() {
  const session = await auth()
  return session?.user && isAdmin(session.user)
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })

  const usuaris = await prisma.usuari.findMany({
    select: { id: true, nom: true, email: true, rol: true, createdAt: true },
    orderBy: { nom: 'asc' },
  })
  return NextResponse.json(usuaris)
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })

  const data = await request.json()
  const nom = typeof data.nom === 'string' ? data.nom.trim() : ''
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : ''
  const password = typeof data.password === 'string' ? data.password : ''
  const rol = data.rol === 'admin' ? 'admin' : 'membre'

  if (!nom || !/^\S+@\S+\.\S+$/.test(email) || password.length < 10) {
    return NextResponse.json({ error: 'Revisa el nom, el correu i una contrasenya de 10 caràcters com a mínim' }, { status: 400 })
  }

  const existent = await prisma.usuari.findUnique({ where: { email }, select: { id: true } })
  if (existent) return NextResponse.json({ error: 'Ja existeix un usuari amb aquest correu' }, { status: 409 })

  const usuari = await prisma.usuari.create({
    data: { nom, email, rol, passwordHash: await hash(password, 12) },
    select: { id: true, nom: true, email: true, rol: true, createdAt: true },
  })
  return NextResponse.json(usuari, { status: 201 })
}
