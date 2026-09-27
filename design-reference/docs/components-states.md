# Componentes e estados

Estados padrão: normal · hover · focus-visible · active · disabled · loading · error · success · warning · critical · empty · offline · permission denied. "—" = não se aplica.

| Componente | Onde | Estados relevantes |
|---|---|---|
| Botão primário/secundário/link/WhatsApp | todos | normal, hover, focus, active, disabled, loading (spinner + rótulo "…ando") |
| Header + mega menu (desktop) | site | fechado, aberto por hover/click, Esc fecha, item atual (`aria-current`) |
| Menu progressivo (tablet/mobile) | site | fechado, aberto, subnível Serviços/Soluções, voltar |
| Footer | site | desktop colunas; mobile accordion (fechado/aberto, `aria-expanded`); faixa de contatos; crédito Kinau (sem sublinhado, hover cor, focus anel) |
| CTA fixo mobile | site | oculto no hero, visível após o hero, oculto na seção do formulário |
| Explorador de ecossistemas | Home | aba ativa (desktop/tablet), accordion (mobile) |
| Diagrama interativo (hero, camadas, contingência Starlink) | site | estado padrão, filtro/alternância ativa, reduced motion |
| FAQ (`details`) | site | fechado, aberto, foco |
| ProjectForm | site | vazio, foco, erro por campo, Estado ≠ RJ (aviso de avaliação), enviando, sucesso |
| Campo de texto/select/textarea | todos | normal, foco, erro, sucesso, disabled |
| Login | Auth | normal, loading, erro de credenciais, conta bloqueada, pendente de aprovação |
| Cadastro CNPJ | Auth | vazio, máscara, erro (14 dígitos), verificando, habilitado, não habilitado |
| MFA | Auth/Portal | escolher método (Passkey/TOTP), códigos de recuperação, adicionar, remover (confirmação), último uso |
| Sessões ativas | Portal/Admin | sessão atual, outras (encerrar), encerrada |
| Card de unidade | Portal | normal, atenção, offline |
| Linha de chamado | Portal/Admin | por status (8), selecionada, SLA em risco, vazio |
| Timeline (chamado/evento/auditoria) | todos internos | entrada pública, nota interna, sistema, crítica |
| Tabela densa | Admin/Central | normal, hover, selecionada, loading (skeleton), vazio, sem resultados, erro, sem permissão; tablet com rolagem horizontal; mobile empilhada |
| KPI | Admin | neutro, atenção, crítico, positivo |
| Chip de status/severidade | todos | ok, warn, crit, info, mute (forma + cor + texto) |
| Fila de eventos | Central | novo (piscando se crítico sem operador), acima do SLA, assumido, em verificação, encerrado, selecionado |
| Ações do evento | Central | habilitada, bloqueada com motivo (tooltip), concluída (✓) |
| Modal crítico (escalonar/emergência/encerrar) | Central | justificativa obrigatória, botão desabilitado até preencher, permissão exibida |
| Câmera (tile) | Central/Artigo | fechada, ao vivo, sem stream |
| Contato de emergência | Central | próximo da ordem, atendeu, sem resposta |
| Redundância | Central › Saúde | normal, degradado, failover, offline |
| Modo supervisão | Central mobile | perfil supervisor (sem assumir) × supervisor + operador |
| Bloco do editor | CMS | normal, hover, mover, remover; mobile compacto (3 linhas) |
| Painel SEO/GEO | CMS | checklist ok/pendente, contador fora do limite, alerta de canibalização |
| Item de mídia | CMS | selecionado, sem alt (aviso), inserido |
| Status de publicação | CMS | rascunho, agendado, publicado, atualizado |
| Estados de tela | Portal/Admin | seletor de protótipo: carregando, vazio, sem resultados, erro, offline, sem permissão, confirmação de exclusão |
