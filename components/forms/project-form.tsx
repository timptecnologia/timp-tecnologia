"use client"

import { useActionState, useRef, useState, type FormEvent } from "react"

import { submitProjectRequest } from "@/lib/forms/project-request"
import type { ProjectRequestState } from "@/lib/forms/project-request-core"
import { WhatsAppIcon, WhatsAppLink } from "@/components/ui/whatsapp-link"
import { SITE, whatsappHref } from "@/lib/site/constants"
import { WA_MESSAGES } from "@/lib/site/whatsapp"
import { PROJECT_SIZES, PROJECT_SOLUTION_LABELS, PROJECT_SOLUTIONS, PROJECT_TYPES, UFS } from "@/lib/forms/project-options"
import { requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

/**
 * ProjectForm (design-reference/prototype/ProjectForm.dc.html).
 * Validação no cliente = UX (mesmas mensagens do protótipo); a validação que vale
 * é a do servidor (lib/forms/project-request.ts). Campos controlados: o estado é
 * preservado após o retorno do servidor.
 */

type Fields = {
  name: string
  company: string
  email: string
  phone: string
  uf: string
  city: string
  projectType: string
  size: string
  solution: string
  message: string
}

const BLANK: Fields = { name: "", company: "", email: "", phone: "", uf: "RJ", city: "", projectType: "", size: "", solution: "", message: "" }
const INITIAL: ProjectRequestState = { status: "idle" }

function clientErrors(f: Fields): Partial<Record<keyof Fields, string>> {
  const x: Partial<Record<keyof Fields, string>> = {}
  if (!f.name.trim()) x.name = "Informe seu nome."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) x.email = "Informe um e-mail válido, como nome@empresa.com.br."
  if (f.phone.replace(/\D/g, "").length < 10) x.phone = "Informe o número completo com DDD."
  if (!f.city.trim()) x.city = "Informe a cidade do projeto."
  if (!f.projectType) x.projectType = "Selecione o tipo de projeto."
  return x
}

const control =
  "h-[52px] w-full rounded-sm border bg-g-900 px-3.5 text-[16px] text-g-100 outline-none transition-[border-color,box-shadow] duration-120 placeholder:text-g-400 focus:border-blue-400 focus:shadow-focus"

export function ProjectForm() {
  const [f, setF] = useState<Fields>(BLANK)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [state, formAction, pending] = useActionState(submitProjectRequest, INITIAL)
  const [editing, setEditing] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const serverErrors = state.status === "error" ? state.fieldErrors ?? {} : {}
  const err = (k: keyof Fields) => errors[k] ?? serverErrors[k]?.[0]
  const set = (k: keyof Fields) => (e: { target: { value: string } }) => {
    const v = e.target.value
    setF((s) => ({ ...s, [k]: v }))
    setErrors((s) => ({ ...s, [k]: undefined }))
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const x = clientErrors(f)
    setEditing(false)
    if (Object.keys(x).length) {
      e.preventDefault()
      setErrors(x)
      const first = Object.keys(x)[0]
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
    }
  }

  const outRJ = f.uf !== "RJ"
  const field = (k: keyof Fields, label: string, required: boolean, input: React.ReactNode) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={`pf-${k}`} className="text-[14px] font-semibold text-g-200">
        {label}
        {required && " *"}
      </label>
      {input}
      {err(k) && (
        <span id={`pf-${k}-err`} className="text-[13px] text-crit-fg">
          {err(k)}
        </span>
      )}
    </div>
  )
  const a11y = (k: keyof Fields) => ({
    id: `pf-${k}`,
    name: k,
    "aria-invalid": err(k) ? true : undefined,
    "aria-describedby": err(k) ? `pf-${k}-err` : undefined,
  })
  const border = (k: keyof Fields) => (err(k) ? "border-crit" : "border-g-600")

  const firstName = f.name.trim().split(" ")[0]
  const panel = "rounded-md border border-blue-800 bg-g-950 p-[clamp(20px,3vw,36px)] text-g-100"

  // Sucesso: a solicitação foi GRAVADA no servidor (nunca antes disso)
  if (state.status === "sent" && !editing) {
    return (
      <div className={panel}>
        <div role="status" className="flex flex-col gap-4 py-3">
          <span className="flex items-center gap-2.5 font-mono text-[12px] tracking-[0.08em] text-ok-fg">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-ok" />
            SOLICITAÇÃO RECEBIDA
          </span>
          <span className="text-[26px] leading-[1.2] font-bold tracking-[-0.02em]">Obrigado{firstName ? `, ${firstName}` : ""}. Sua solicitação foi registrada.</span>
          <span className="text-[16px] leading-[1.6] text-g-300">
            A equipe comercial da Timp retorna pelo e-mail ou WhatsApp informado com o próximo passo: visita técnica, diagnóstico ou proposta de projeto.
          </span>
          {outRJ && (
            <span className="text-[15px] leading-[1.6] text-blue-300">
              Projeto em {f.city}/{f.uf}: a avaliação considera porte, escopo e viabilidade logística.
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setF(BLANK)
              setEditing(true)
            }}
            className="h-11 cursor-pointer self-start rounded-sm border border-g-600 px-4 text-[14px] font-semibold text-g-100"
          >
            Enviar outra solicitação
          </button>
        </div>
      </div>
    )
  }

  // Gravação indisponível: nada foi registrado — orienta o envio por WhatsApp/e-mail
  if (state.status === "unavailable" && !editing) {
    const summary = state.summary || WA_MESSAGES.contato
    return (
      <div className={panel}>
        <div role="alert" className="flex flex-col gap-4 py-3">
          <span className="flex items-center gap-2.5 font-mono text-[12px] tracking-[0.08em] text-warn">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-warn" />
            SOLICITAÇÃO NÃO REGISTRADA
          </span>
          <span className="text-[16px] leading-[1.6] text-g-200">{state.message}</span>
          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappHref(summary)}
              target="_blank"
              rel="noopener noreferrer"
              data-wa-context="contato"
              className="inline-flex h-[52px] items-center gap-2.5 rounded-sm border border-wa bg-wa px-6 text-[16px] font-semibold text-wa-ink no-underline hover:bg-wa-strong hover:text-wa-ink"
            >
              <WhatsAppIcon />
              Enviar pelo WhatsApp
            </a>
            <a
              href={`mailto:${SITE.email}?subject=${encodeURIComponent("Solicitação de projeto — site")}&body=${encodeURIComponent(summary)}`}
              className="inline-flex h-[52px] items-center rounded-sm border border-g-600 px-6 text-[16px] font-semibold text-g-100 no-underline hover:border-g-400 hover:text-white"
            >
              Enviar por e-mail
            </a>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="h-11 cursor-pointer self-start rounded-sm border border-g-600 px-4 text-[14px] font-semibold text-g-100"
          >
            Voltar ao formulário
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-blue-800 bg-g-950 p-[clamp(20px,3vw,36px)] text-g-100">
      <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate className="flex flex-col gap-[18px]" aria-label="Solicitar um projeto">
        <div className="grid grid-cols-1 gap-[18px] tablet:grid-cols-2">
          {field("name", "Nome", true, <input type="text" autoComplete="name" value={f.name} onChange={set("name")} className={cn(control, border("name"))} {...a11y("name")} />)}
          {field("company", "Empresa", false, <input type="text" autoComplete="organization" value={f.company} onChange={set("company")} className={cn(control, "border-g-600")} {...a11y("company")} />)}
          {field("email", "E-mail", true, <input type="email" autoComplete="email" value={f.email} onChange={set("email")} className={cn(control, border("email"))} {...a11y("email")} />)}
          {field(
            "phone",
            "WhatsApp",
            true,
            <input type="tel" inputMode="tel" autoComplete="tel" placeholder="(21) 90000-0000" value={f.phone} onChange={set("phone")} className={cn(control, border("phone"))} {...a11y("phone")} />,
          )}
        </div>
        <div className="grid grid-cols-[minmax(96px,0.4fr)_minmax(0,1fr)] gap-[18px]">
          {field(
            "uf",
            "Estado",
            true,
            <select value={f.uf} onChange={set("uf")} autoComplete="address-level1" className={cn(control, "border-g-600 px-2.5")} {...a11y("uf")}>
              {UFS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>,
          )}
          {field(
            "city",
            "Cidade",
            true,
            <input type="text" autoComplete="address-level2" placeholder="Rio de Janeiro" value={f.city} onChange={set("city")} className={cn(control, border("city"))} {...a11y("city")} />,
          )}
        </div>
        {outRJ && (
          <div role="note" className="flex gap-3 rounded-sm border border-blue-500 bg-blue-500/10 px-4 py-3.5">
            <span aria-hidden="true" className="pt-0.5 font-mono text-[12px] text-blue-300">
              i
            </span>
            <span className="text-[14px] leading-[1.55] text-g-200">Projetos fora do Rio de Janeiro são avaliados conforme porte, escopo e viabilidade logística.</span>
          </div>
        )}
        <div className="grid grid-cols-1 gap-[18px] tablet:grid-cols-2">
          {field(
            "projectType",
            "Tipo de projeto",
            true,
            <select value={f.projectType} onChange={set("projectType")} className={cn(control, border("projectType"), "px-2.5")} {...a11y("projectType")}>
              <option value="">Selecione</option>
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>,
          )}
          {field(
            "size",
            "Porte aproximado",
            false,
            <select value={f.size} onChange={set("size")} className={cn(control, "border-g-600 px-2.5")} {...a11y("size")}>
              <option value="">Selecione</option>
              {PROJECT_SIZES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>,
          )}
        </div>
        {field(
          "solution",
          "Solução de interesse",
          false,
          <select value={f.solution} onChange={set("solution")} className={cn(control, "border-g-600 px-2.5")} {...a11y("solution")}>
            <option value="">Selecione</option>
            {PROJECT_SOLUTIONS.map((v) => (
              <option key={v} value={v}>
                {PROJECT_SOLUTION_LABELS[v] ?? v}
              </option>
            ))}
          </select>,
        )}
        {field(
          "message",
          "Descrição",
          false,
          <textarea
            rows={4}
            value={f.message}
            onChange={set("message")}
            placeholder="Tipo de imóvel, número de unidades, prazo da obra…"
            className="w-full resize-y rounded-sm border border-g-600 bg-g-900 px-3.5 py-3 text-[16px] leading-normal text-g-100 outline-none placeholder:text-g-400 focus:border-blue-400 focus:shadow-focus"
            {...a11y("message")}
          />,
        )}
        {/* Honeypot: invisível para pessoas, fora da ordem de tabulação */}
        <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
          <label htmlFor="pf-website">Site</label>
          <input id="pf-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
        {state.status === "error" && state.message && (
          <p role="alert" className="m-0 text-[14px] text-crit-fg">
            {state.message}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 pt-1">
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending || undefined}
            className="inline-flex h-[52px] cursor-pointer items-center gap-2.5 rounded-sm bg-blue-600 px-6 text-[16px] font-semibold whitespace-nowrap text-white shadow-primary-inset hover:bg-blue-650 disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? "Enviando…" : "Solicitar um projeto"} <span aria-hidden="true">→</span>
          </button>
          <WhatsAppLink context="contato" className="min-h-11 px-4 text-[15px]">
            Prefiro o WhatsApp
          </WhatsAppLink>
        </div>
        <p className="m-0 text-[13px] leading-normal text-g-400">
          * Campos obrigatórios. Usamos estes dados somente para responder a esta solicitação de projeto.{" "}
          <a href={requiredHref("privacidade")} className="text-g-200 underline underline-offset-2 hover:text-white">
            Política de Privacidade
          </a>
          .
        </p>
      </form>
    </div>
  )
}
