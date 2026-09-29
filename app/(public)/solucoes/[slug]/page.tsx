import { notFound } from "next/navigation"

import { SolutionPage } from "@/components/templates/solution-page"
import { SOLUTIONS } from "@/lib/content/solutions"
import { buildMetadata } from "@/lib/seo/metadata"
import { ROUTES, SOLUTION_KEYS, entryId, type SolutionKey } from "@/lib/site/routes"

/** Uma URL por segmento (SSG). Slugs fora da lista → 404. */
export const dynamicParams = false

const bySlug = new Map<string, SolutionKey>(SOLUTION_KEYS.map((k) => [entryId(ROUTES[k].path), k]))

export function generateStaticParams() {
  return [...bySlug.keys()].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<"/solucoes/[slug]">) {
  const key = bySlug.get((await params).slug)
  if (!key) return {}
  return buildMetadata({ ...SOLUTIONS[key].seo, path: ROUTES[key].path })
}

export default async function SolucaoPage({ params }: PageProps<"/solucoes/[slug]">) {
  const key = bySlug.get((await params).slug)
  if (!key) notFound()
  return <SolutionPage s={SOLUTIONS[key]} />
}
