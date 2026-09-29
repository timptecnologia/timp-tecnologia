/** Opções do formulário de projeto (sem dependências: seguro para o bundle do cliente). */
export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const
export const PROJECT_TYPES = ["Empresa", "Construtora / obra", "Condomínio / empreendimento", "Múltiplas unidades", "Outro"] as const
export const PROJECT_SIZES = ["Pequeno", "Médio", "Grande", "Projeto especial"] as const
export const PROJECT_SOLUTIONS = [
  "Infraestrutura e Conectividade",
  "Instalação de Starlink",
  "Segurança Eletrônica",
  "TI Corporativa",
  "Automação e Comunicação",
  "Monitoramento 24h",
  "Ainda não sei",
] as const

/** Rótulo exibido quando difere do valor enviado (ProjectForm.dc.html). */
export const PROJECT_SOLUTION_LABELS: Partial<Record<(typeof PROJECT_SOLUTIONS)[number], string>> = {
  "Ainda não sei": "Ainda não sei — preciso de um diagnóstico",
}
