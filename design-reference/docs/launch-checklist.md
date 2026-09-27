# Checklist de lançamento — timp.com.br

## Pré-lançamento
- [ ] `sitemap.xml` gerado com todas as URLs de `docs/sitemap.md` publicadas
- [ ] `robots.txt` (bloquear Portal, Admin, Central, CMS, Auth e ambientes de teste)
- [ ] `canonical` em todas as páginas
- [ ] Titles únicos por página
- [ ] Meta descriptions únicas por página
- [ ] Um H1 por página; hierarquia H2/H3 correta
- [ ] Schema (Organization, LocalBusiness, Service, Article, FAQPage, BreadcrumbList) conforme `seo-geo/seo-geo.md`
- [ ] Open Graph + imagem OG 1200×630 por página principal
- [ ] Alt text em todas as imagens informativas; decorativas com `alt=""` / `aria-hidden`
- [ ] Redirects 301 das URLs antigas (se houver site anterior)
- [ ] Página 404 útil (busca + links principais)
- [ ] Sem links quebrados; nenhum `href="#"`
- [ ] HTTPS em todos os recursos (sem mixed content)
- [ ] Core Web Vitals no mobile: LCP < 2,5 s · INP < 200 ms · CLS < 0,1
- [ ] Teste real em mobile (iOS Safari e Android Chrome), tablet e desktop
- [ ] Acessibilidade WCAG 2.2 AA (teclado, foco, contraste, reduced motion, leitor de tela)
- [ ] Security review concluída (`docs/security-requirements.md`; relatórios SECURITY-*)
- [ ] Backups configurados e restauração testada
- [ ] Formulários: validação, entrega, anti-spam, rate limit, mensagem de sucesso/erro
- [ ] Política de cookies e privacidade (LGPD) publicadas; banner de consentimento se houver cookies não essenciais

## Lançamento
- [ ] Domínio timp.com.br apontado
- [ ] DNS (A/AAAA/CNAME, MX preservado, SPF/DKIM/DMARC do e-mail)
- [ ] HTTPS ativo com renovação automática
- [ ] Google Search Console verificado
- [ ] Sitemap enviado ao Search Console
- [ ] Google Business Profile atualizado (site, categorias, área de atendimento)
- [ ] Analytics, se adotado (opcional; respeitar privacidade/LGPD e consentimento)
- [ ] Políticas de cookies/privacidade acessíveis no footer
- [ ] Testes de conversão ponta a ponta (formulário, WhatsApp, e-mail)
- [ ] Solicitar indexação das páginas principais (Home, serviços, Starlink, Construtoras, Monitoramento 24h)

## Pós-lançamento (acompanhamento contínuo)
- Search Console: cobertura, indexação, consultas
- Core Web Vitals (dados de campo)
- Erros de aplicação, 404 e 500
- Rankings e consultas por cluster (ownership em `seo-geo/seo-geo.md`)
- Tráfego e conversões
- Uptime
- Logs (sem PII)
- Vulnerabilidades e atualizações de dependências
- Backlinks
- Google Business Profile (avaliações, perguntas)
- Conteúdo: calendário do blog, atualização de artigos
- Links internos (órfãos, âncoras, canibalização)

Google Analytics é opcional e precisa respeitar privacidade/LGPD.
