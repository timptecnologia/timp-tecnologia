/** Link "pular para o conteúdo" — primeiro elemento focável de toda página. */
export function SkipLink({ targetId = "conteudo" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only z-(--z-skip-link) rounded-sm bg-primary px-4 py-3 font-semibold text-primary-foreground no-underline focus:not-sr-only focus:fixed focus:top-3 focus:left-3 hover:text-primary-foreground"
    >
      Pular para o conteúdo
    </a>
  )
}
