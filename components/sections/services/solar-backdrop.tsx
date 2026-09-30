import { PhotoBackdrop } from "@/components/sections/shared/photo-backdrop"
import { SOLAR_HERO } from "@/lib/content/backdrops"

/**
 * Abertura de /servicos/energia-solar/: painéis solares num terraço sobre a Baía de
 * Guanabara ao anoitecer (public/home/energia-solar/). Desktop: texto no céu (esquerda),
 * painéis livres embaixo à direita; mobile: céu atrás do texto e painéis na janela final.
 * Implementação em PhotoBackdrop (picture SSR, eager + preload: é a abertura da página).
 */
export function SolarBackdrop() {
  return <PhotoBackdrop name="energia-solar" photo={SOLAR_HERO} priority strong baseFade={false} position="tablet:object-[70%_100%]" />
}
