import { notFound } from "next/navigation"

import { ArticlePage } from "@/components/templates/article-page"
import { ARTICLES, getArticle } from "@/lib/content/articles"
import { buildMetadata } from "@/lib/seo/metadata"
import { articlePath } from "@/lib/site/routes"

/** Um artigo por URL (SSG). Slugs fora da lista → 404. */
export const dynamicParams = false

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const a = getArticle((await params).slug)
  if (!a) return {}
  return buildMetadata({ ...a.seo, path: articlePath(a.slug), type: "article" })
}

export default async function ArtigoPage({ params }: PageProps<"/blog/[slug]">) {
  const a = getArticle((await params).slug)
  if (!a) notFound()
  return <ArticlePage a={a} />
}
