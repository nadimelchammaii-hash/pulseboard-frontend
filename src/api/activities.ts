import client from './client'

export interface ActivityCauser {
  id: number
  name: string
  email: string
}

export interface ActivityProjectRef {
  id: number
  name: string
}

export interface Activity {
  id: number
  action: string
  causer: ActivityCauser
  project: ActivityProjectRef | null
  data: Record<string, string>
  created_at: string
}

interface ActivityListResponse {
  data: Activity[]
  meta: {
    current_page: number
    last_page: number
  }
}

export interface ActivityPage {
  activities: Activity[]
  currentPage: number
  lastPage: number
}

export async function listActivities (workspaceId: number, page = 1): Promise<ActivityPage> {
  const { data } = await client.get<ActivityListResponse>(`/api/v1/workspaces/${workspaceId}/activities`, {
    params: { page },
  })

  return {
    activities: data.data,
    currentPage: data.meta.current_page,
    lastPage: data.meta.last_page,
  }
}
