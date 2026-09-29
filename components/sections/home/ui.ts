/**
 * Classes compartilhadas das seções públicas — protótipo final (Home.dc.html): contêiner
 * 1440, margens clamp(20–64), eyebrow mono 12/.1em, H2 em duas escalas.
 * Ritmo vertical revisto na rodada pós-2A (docs/MACROFASE-2A-HOME.md §7.8): o respiro do
 * protótipo, clamp(64–128) por lado, somava até 256 px entre seções; agora clamp(48–96)
 * — 48 px no mobile, ~94 px em 1440 — e `padTight` para faixas curtas (teaser, CTA).
 */
export const S = {
  container: "mx-auto w-full max-w-[1440px] px-[clamp(20px,5vw,64px)]",
  pad: "py-[clamp(48px,6.5vw,96px)]",
  padTight: "py-[clamp(40px,4.5vw,64px)]",
  eyebrow: "font-mono text-[12px] tracking-[0.1em]",
  h2: "m-0 text-[clamp(30px,3.6vw,52px)] leading-[1.05] font-bold tracking-[-0.03em] text-balance",
  h2Lg: "m-0 text-[clamp(34px,4.4vw,64px)] leading-none font-bold tracking-[-0.035em] text-balance",
  lead: "m-0 text-[17px] leading-[1.6] text-pretty",
  lead18: "m-0 text-[18px] leading-[1.6] text-pretty",
  btnPrimary:
    "inline-flex min-h-[52px] items-center gap-2.5 rounded-sm bg-blue-600 px-[22px] py-2 text-[16px] leading-tight font-semibold text-white no-underline hover:bg-blue-650 hover:text-white tablet:whitespace-nowrap",
  btnSecondary:
    "inline-flex min-h-[52px] items-center rounded-sm border border-g-600 bg-g-950/60 px-[22px] py-2 text-[16px] leading-tight font-semibold text-g-100 no-underline hover:border-g-400 hover:text-white tablet:whitespace-nowrap",
  chip: "rounded-[3px] border border-g-600 bg-g-950/70 px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap text-g-200",
} as const
