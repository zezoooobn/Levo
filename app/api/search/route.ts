import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const provider = process.env.SERPER_API_KEY ? 'serper' : (process.env.GOOGLE_CSE_KEY && process.env.GOOGLE_CSE_ID ? 'google' : 'none')

  if (!q.trim()) {
    return NextResponse.json({ results: [], provider, error: 'empty_query' }, { status: 200 })
  }

  try {
    if (provider === 'serper') {
      const resp = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.SERPER_API_KEY as string,
        },
        body: JSON.stringify({ q, gl: 'eg', hl: 'ar' }),
      })
      const data = await resp.json()
      const results = (data.organic || []).slice(0, 5).map((r: any) => ({ title: r.title, link: r.link, snippet: r.snippet }))
      return NextResponse.json({ results, provider }, { status: 200 })
    }
    if (provider === 'google') {
      const key = process.env.GOOGLE_CSE_KEY as string
      const cx = process.env.GOOGLE_CSE_ID as string
      const resp = await fetch(`https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${encodeURIComponent(q)}&hl=ar`)
      const data = await resp.json()
      const results = (data.items || []).slice(0, 5).map((r: any) => ({ title: r.title, link: r.link, snippet: r.snippet }))
      return NextResponse.json({ results, provider }, { status: 200 })
    }
    return NextResponse.json({ results: [], provider, error: 'no_provider' }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ results: [], provider, error: 'fetch_failed' }, { status: 200 })
  }
}