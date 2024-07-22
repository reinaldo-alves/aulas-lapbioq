export interface IAula {
  id: string,
  info: {
    nome: string,
    curso: string,
    data: string,
    inicio: string,
    termino: string,
    tecnico: string | null
  }
}

export interface ICurso {
  id: string,
  info: {
    nome: string,
    aulas: Array<{
      nome: string,
      inicio: string,
      termino: string,
    }>
  }
}

export interface ITecnico {
  id: string,
  info: {
    nome: string
  }
}