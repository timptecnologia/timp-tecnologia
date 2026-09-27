# Fluxos principais

## Auth
1. Login: e-mail + senha → MFA (se exigido pelo perfil) → Portal (cliente) / Admin ou Central (TIMP). Erros: credenciais, bloqueada, pendente, sessão expirada (volta à tela anterior após login).
2. Cadastro: Criar conta → CNPJ → habilitado? → não: bloqueia e oferece contato TIMP · sim: nome, e-mail, telefone, senha → confirmação de e-mail (24 h) → aprovação → primeiro acesso → cadastro de MFA (Passkey/TOTP + códigos).
3. Aprovação: 1º Cliente Admin → TIMP · usuário comum → Cliente Admin ou TIMP · promoção a Cliente Admin → TIMP · bloqueio/suspensão/revogação → TIMP (override). Tudo auditado.
4. Recuperação: esqueci → e-mail (resposta neutra) → link 60 min uso único → nova senha → encerra outras sessões. Perda de MFA: código de recuperação → cadastrar novo método.

## Portal
- Novo chamado: unidade → categoria → equipamento (opcional) → resumo → descrição → impacto → anexos → criado (#) → triagem TIMP → acompanhamento/timeline/comentários.
- Unidade: lista (busca/filtro) → detalhe (sistemas, dados, contatos de emergência; alterações revisadas pela TIMP).
- Ativo: lista por unidade → status → chamado relacionado.
- Monitoramento: status por unidade → ocorrências recentes → timeline simplificada → relatório mensal.

## Admin
- Cliente: habilitar CNPJ → empresa → unidades → contrato → usuários (aprovar) → ativos.
- Contrato: serviços, valor, vigência, horas, SLA → saúde (horas usadas, SLA, margem).
- Rentabilidade: empresa + período → valor, horas, visitas, deslocamentos, custo, margem → categorias/recorrência → sugestão (renegociar/substituir ativo).
- Help Desk: fila por SLA → filtros → detalhe → assumir → atribuir técnico → status → nota interna × resposta → resolvido → encerrado.

## Central
Evento recebido (gateway, normalizado) → NOVO na fila por prioridade (SLA para assumir) → Assumir (A) → Iniciar verificação → Abrir câmeras da zona (C) → Protocolo da unidade (horário, prioridade) → Contatos em ordem (atendeu / sem resposta) → Escalonar (E, justificativa) · Serviço de emergência (só após verificação, justificativa, permissão N2) → Classificar (confirmado, falso positivo, falha técnica, sem resposta) + justificativa → ENCERRADO → Ocorrências + Auditoria.
Evento → Chamado: recorrência detectada → Abrir chamado técnico → vinculado ao ativo → técnico → manutenção → histórico no ativo.
Supervisão mobile: fila → evento → reconhecer / atribuir / abrir câmeras / protocolo e contatos / escalonar → timeline (assumir só com permissão operacional).

## CMS
Novo artigo → H1 → blocos → SEO/GEO (keyword, intenção, cluster, página apoiada, title, description, slug, canonical, OG) → alerta de canibalização → mídia (alt obrigatório) → links de saída/entrada + "conteúdos que podem linkar" → autoria/revisão → preview → agendar/publicar → atualizar (nova versão; dateModified só com revisão real).
