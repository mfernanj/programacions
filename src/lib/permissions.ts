type SessionUser = { id?: string; rol?: string } | undefined

export function isAdmin(user: SessionUser) {
  return user?.rol === 'admin'
}

export function canManage(authorId: string, user: SessionUser) {
  return isAdmin(user) || user?.id === authorId
}
