export async function searchWeb(q: string): Promise<Array<{title: string, link: string, snippet: string}>> {
  try {
    const resp = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
    const data = await resp.json()
    return data.results || []
  } catch {
    return []
  }
}