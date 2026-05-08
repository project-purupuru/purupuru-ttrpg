// Local Blink preview page · renders Solana Action JSON as a card.
// Replacement for dial.to (paused) · also useful as permanent dev tool.
//
// Usage:
//   /preview                       → defaults to /api/actions/quiz/start
//   /preview?url=<absolute-or-rel> → renders any action URL
//   buttons inside the card link to /preview?url=<button.href>
//   so you can walk the full chain visually.

import Link from "next/link"

interface ActionResponse {
  icon: string
  title: string
  description: string
  label: string
  links?: {
    actions: Array<{ label: string; href: string }>
  }
  error?: { message?: string }
}

interface PageProps {
  searchParams: Promise<{ url?: string }>
}

async function fetchAction(targetUrl: string): Promise<{
  data: ActionResponse | null
  status: number
  raw: string
}> {
  try {
    const res = await fetch(targetUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    const raw = await res.text()
    let data: ActionResponse | null = null
    try {
      data = JSON.parse(raw)
    } catch {
      // raw stays · we'll show it
    }
    return { data, status: res.status, raw }
  } catch (err) {
    return { data: null, status: 0, raw: String(err) }
  }
}

function previewHref(actionUrl: string): string {
  return `/preview?url=${encodeURIComponent(actionUrl)}`
}

export default async function PreviewPage({ searchParams }: PageProps) {
  const params = await searchParams
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  const targetUrl = params.url ?? `${baseUrl}/api/actions/quiz/start`

  const { data, status, raw } = await fetchAction(targetUrl)

  return (
    <main className="min-h-screen bg-puru-cloud-deep p-6 md:p-12 font-puru-body">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header · which endpoint we're previewing */}
        <header className="space-y-2">
          <h1 className="text-puru-ink-base text-2xl font-puru-display">
            Blink Preview
          </h1>
          <div className="text-puru-ink-soft text-xs font-puru-mono break-all">
            <span className="text-puru-ink-dim">target → </span>
            <span>{targetUrl}</span>
            <span className="text-puru-ink-dim ml-2">
              [HTTP {status || "fail"}]
            </span>
          </div>
          <div className="flex gap-3 text-xs text-puru-ink-dim font-puru-mono">
            <Link
              href="/preview"
              className="underline hover:text-puru-ink-base"
            >
              ↻ start over (Q1)
            </Link>
            <Link
              href={`/preview?url=${encodeURIComponent(`${baseUrl}/api/actions/today`)}`}
              className="underline hover:text-puru-ink-base"
            >
              ☼ ambient
            </Link>
          </div>
        </header>

        {/* Card · the actual Blink render */}
        {data ? (
          <article className="bg-puru-cloud-bright border border-puru-cloud-shadow rounded-2xl shadow-xl overflow-hidden">
            {/* Icon */}
            <div className="aspect-square bg-puru-cloud-base relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.icon}
                alt={data.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center text-puru-ink-dim text-xs font-puru-mono pointer-events-none">
                {/* Visible only if the img fails to load · gives you a placeholder */}
                <span className="bg-puru-cloud-bright/90 px-3 py-1 rounded">
                  icon → {data.icon}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3">
              <h2 className="text-puru-ink-rich text-lg font-puru-display leading-puru-tight">
                {data.title}
              </h2>
              <p className="text-puru-ink-base text-sm leading-puru-relaxed whitespace-pre-line">
                {data.description}
              </p>
              {data.error?.message && (
                <p className="text-puru-fire-vivid text-xs font-puru-mono">
                  ⚠ {data.error.message}
                </p>
              )}
            </div>

            {/* Buttons · each links to /preview?url=<href> so the chain works */}
            {data.links?.actions && data.links.actions.length > 0 && (
              <div className="px-6 pb-6 space-y-2">
                {data.links.actions.map((btn, i) => (
                  <Link
                    key={i}
                    href={previewHref(btn.href)}
                    className="block w-full px-4 py-3 text-sm text-puru-ink-rich bg-puru-cloud-base border border-puru-cloud-shadow rounded-xl hover:bg-puru-cloud-dim transition-colors text-left"
                  >
                    {btn.label}
                  </Link>
                ))}
              </div>
            )}
          </article>
        ) : (
          <div className="bg-puru-fire-pastel border border-puru-fire-vivid rounded-xl p-4 text-puru-ink-rich text-sm">
            <p className="font-puru-display text-base mb-2">Could not parse action JSON</p>
            <pre className="text-xs font-puru-mono whitespace-pre-wrap break-all">
              {raw}
            </pre>
          </div>
        )}

        {/* Raw JSON · always shown for debug */}
        {data && (
          <details className="text-xs">
            <summary className="cursor-pointer text-puru-ink-dim font-puru-mono hover:text-puru-ink-base">
              ▾ raw JSON
            </summary>
            <pre className="mt-2 p-4 bg-puru-cloud-shadow rounded-lg text-puru-ink-soft overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </main>
  )
}
