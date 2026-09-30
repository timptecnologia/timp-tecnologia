import { cn } from "@/lib/utils"

const BOX = "col-start-1 row-start-1 inline-flex h-11 items-center justify-center rounded-sm border px-3.5 text-[13px] font-semibold whitespace-nowrap"

/**
 * Único controle das demonstrações passivas (Starlink e Central): Pausar/Retomar.
 * O espaço é SEMPRE reservado — uma réplica invisível com o rótulo mais longo ocupa a célula
 * no HTML inicial, antes da animação começar e com reduced motion — então o botão aparecer
 * (ou trocar de rótulo) não desloca nada (sem CLS).
 */
export function DemoPauseButton({ animated, paused, onToggle, className }: { animated: boolean; paused: boolean; onToggle: () => void; className?: string }) {
  return (
    <span className={cn("grid flex-none", className)}>
      <span aria-hidden="true" className={cn(BOX, "invisible border-transparent")}>
        Retomar demonstração
      </span>
      {animated && (
        <button type="button" onClick={onToggle} aria-pressed={paused} className={cn(BOX, "cursor-pointer border-g-600 text-g-100 hover:border-g-400")}>
          {paused ? "Retomar demonstração" : "Pausar demonstração"}
        </button>
      )}
    </span>
  )
}
