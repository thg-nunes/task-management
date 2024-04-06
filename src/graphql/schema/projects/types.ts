export type Project = {
  id: string
  name: string
  description: string
  start_date: Date
  observations: string
  started: boolean
  delivery_date: Date
  status: string
  category: string
  author_id: string
}

type ProjectMembers = {
  user_id: string
  project_id: string
}

export type CreateProjectInput = {
  projectData: {
    name: string
    author_id: string
    description: string
    start_date?: Date
    observations?: string
    started?: boolean
    delivery_date?: Date
    status?: string
    category?: string
  }
}
