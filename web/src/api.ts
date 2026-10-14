import type { ApiResult, Entry, Settings } from './types'

const STORAGE_KEY = 'timesheet.settings'

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>
      return { url: parsed.url ?? '', apiKey: parsed.apiKey ?? '' }
    }
  } catch {
    return { url: '', apiKey: '' }
  }
  return { url: '', apiKey: '' }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

async function call(body: Record<string, unknown>): Promise<ApiResult> {
  const { url, apiKey } = loadSettings()
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...body, apiKey }),
  })
  const data = await response.json()
  if (data.error) throw new Error(data.error)
  return data as ApiResult
}

export function fetchMonth(date: string): Promise<ApiResult> {
  return call({ action: 'month', date })
}

export function sendEntry(date: string, entry: Entry): Promise<ApiResult> {
  return call({ action: 'entry', date, ...entry })
}
