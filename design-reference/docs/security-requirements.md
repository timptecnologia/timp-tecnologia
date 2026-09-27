# Requisitos de segurança — obrigatórios na implementação

**Nesta rodada nada foi implementado.** Este documento registra requisitos para o Claude Code.

- **Segurança é parte da arquitetura desde a Macrofase 1 (Fundação).** Não é uma etapa final.
- **Código gerado por IA é NÃO CONFIÁVEL POR PADRÃO** até revisão humana e testes (inclusive negativos).
- Nunca declarar "100% seguro". Documentar riscos residuais.

Complementa `CLAUDE-CODE-HANDOFF.md` §15–17 (contas, sessões, MFA, regras de aprovação, roles).

## Secrets
- Nenhum segredo hardcoded (código, testes, seeds, fixtures, docs).
- `.env` com segredos fora do Git (`.gitignore`); `.env.example` sem valores reais.
- Separar variáveis públicas de privadas. Nenhum segredo em `NEXT_PUBLIC_*`.
- Supabase `service_role` / secret key somente server-side (nunca no bundle, nunca no browser).
- Secret scanning no repositório e no CI (pre-commit + pipeline).
- Segredo exposto = rotação imediata + registro do incidente.

## Supabase / banco
- RLS habilitado desde a fundação em todas as tabelas com dados de cliente.
- Deny by default; grants mínimos por role.
- Policies testadas **negativamente** (o acesso proibido precisa falhar).
- Isolamento por tenant (empresa → unidade → usuário).
- Operações privilegiadas somente server-side, com checagem de permissão explícita.

## Multi-tenant / IDOR
Empresa A jamais acessa dados da Empresa B. Testar manipulação de:
`company_id`, `user_id`, `unit_id`, `ticket_id`, `asset_id`, `contract_id`, `event_id`, `incident_id`.
Toda consulta resolve o tenant a partir da sessão, nunca de parâmetro do client.

## Auth
- Autenticação robusta; autorização verificada em **cada** operação.
- MFA obrigatório para perfis privilegiados (TIMP Admin, TIMP Operador, Cliente Admin, perfis TIMP com acesso privilegiado).
- Passkey/WebAuthn preferencial; TOTP; recovery codes. SMS não é fator principal para contas privilegiadas.
- Gerenciamento de sessões (listar, encerrar, expirar por inatividade).
- Recuperação de conta segura (tokens de uso único, expiração curta, sem enumeração de usuários).

## Browser storage
- Evitar token e PII em `localStorage`.
- `sessionStorage` não é storage seguro.
- Cookies sensíveis: `HttpOnly`, `Secure`, `SameSite` adequado (Lax/Strict conforme o fluxo).

## Validação no servidor
Frontend valida UX. Backend valida segurança. Nunca confiar em campos hidden, botões desabilitados, role enviada pelo client ou IDs enviados pelo client. Schemas de entrada validados no servidor (tipo, formato, tamanho, allowlist de campos).

## Vulnerabilidades a mitigar e testar
SQL Injection · XSS · CSRF · SSRF · mass assignment · brute force · IDOR · uploads inseguros · replay / duplo envio (idempotência).

## Rate limit
Login · recuperação de senha · cadastro · MFA · formulários públicos · uploads · APIs · endpoints caros · integrações pagas.

## APIs pagas
Quotas · rate limit · monitoramento de consumo · alertas · idempotência · circuit breaker · kill switch · budgets no provedor quando disponíveis.

## Respostas de API
Retornar somente os campos necessários. Evitar `select *` em áreas sensíveis. Nunca retornar secrets ou PII indevida. Erros sem stack trace em produção.

## Uploads
Validar MIME (por conteúdo, não só header), extensão, tamanho, nome (normalizado), conteúdo e path (sem path traversal). Arquivos privados em bucket privado, servidos com autorização e URL assinada de curta duração.

## Headers / transporte
HTTPS · HSTS · CSP (sem `unsafe-inline` onde possível; nonces) · `X-Content-Type-Options: nosniff` · `Referrer-Policy` · `Permissions-Policy` · `frame-ancestors` · CORS restritivo (allowlist).

## Logs
Não logar senha, token, API key, cookie, secret nem PII desnecessária. Masking/redaction na camada de log.

## Audit trail
Registrar ações críticas (imutável): Admin, usuários, permissões, contratos, Central, monitoramento (evento, classificação, encerramento, escalonamento, acionamentos).

## Dependências
Dependency scanning (CI) · revisão de supply chain antes de adicionar pacote · não instalar plugins aleatórios · lockfile versionado. Ferramentas como Trail of Bits `insecure-defaults` podem ser usadas como camada complementar.

## Infraestrutura (se houver VPS/Docker)
Banco em rede privada · PostgreSQL nunca exposto diretamente · firewall · credenciais fortes · contas separadas por serviço · nenhum password default.

## Acessos
Least privilege · inventário de acessos · offboarding com revogação · revisão periódica.

## Testes obrigatórios antes de produção
Acesso anônimo · role errada · tenant errado · chamada direta à API (sem frontend) · manipulação de ID · inspeção de DevTools (Storage, Network) · análise do bundle · busca de secrets · testes sem o frontend.

## Relatórios que o Claude Code deve produzir
- `SECURITY-ARCHITECTURE.md`
- `SECURITY-CHECKLIST.md`
- `SECURITY-FINDINGS.md`
- `SECURITY-REVIEW.md`
Cada um com data, escopo, o que foi testado, resultado e riscos residuais.
