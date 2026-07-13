export type CursEscolar = {
  id: string
  anyInici: number
  anyFi: number
  actiu: boolean
}

export type Materia = {
  id: string
  nom: string
}

export type Nivell = {
  id: string
  nom: string
  matèries: Materia[]
}
