"use client";

import { Eye, EyeOff, PackageCheck, Repeat, Shirt } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { maskDoc, maskPhone } from "@/lib/format";
import { login, register } from "@/lib/store";
import { isDoc, isEmail, isPhone } from "@/lib/validation";
import { Button, Field, Input, Spinner, useUi } from "./ui";

function Password({ value, onChange, invalid, autoComplete }: { value: string; onChange: (v: string) => void; invalid?: boolean; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} aria-invalid={invalid} aria-label="Senha" className="pr-11" />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-mute hover:text-text" aria-label={show ? "Esconder senha" : "Mostrar senha"}>
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function AuthView() {
  const [tab, setTab] = useState<"entrar" | "criar">("entrar");
  const router = useRouter();
  const params = useSearchParams();
  const back = params.get("voltar") || "/minha-conta";
  const { toast } = useUi();
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loginErr, setLoginErr] = useState<{ email?: string; pass?: string; form?: string }>({});

  const [reg, setReg] = useState({ name: "", company: "", email: "", phone: "", doc: "", pass: "" });
  const [regErr, setRegErr] = useState<Partial<Record<keyof typeof reg | "form", string>>>({});

  function doLogin() {
    const e: typeof loginErr = {};
    if (!isEmail(email)) e.email = "Digite um e-mail válido.";
    if (!pass) e.pass = "Digite a sua senha.";
    setLoginErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    window.setTimeout(() => {
      const err = login(email, pass);
      setBusy(false);
      if (err) {
        setLoginErr({ form: err });
        return;
      }
      toast("Bem-vindo de volta!");
      router.push(back);
    }, 600);
  }

  function doRegister() {
    const e: typeof regErr = {};
    if (reg.name.trim().split(/\s+/).length < 2) e.name = "Informe nome e sobrenome.";
    if (!isEmail(reg.email)) e.email = "Digite um e-mail válido.";
    if (!isPhone(reg.phone)) e.phone = "Informe o telefone com DDD.";
    if (!isDoc(reg.doc)) e.doc = "CPF ou CNPJ inválido.";
    if (reg.pass.length < 8 || !/\d/.test(reg.pass)) e.pass = "Use pelo menos 8 caracteres, com 1 número.";
    setRegErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    window.setTimeout(() => {
      const err = register({ name: reg.name, email: reg.email, password: reg.pass, phone: reg.phone, doc: reg.doc, company: reg.company });
      setBusy(false);
      if (err) {
        setRegErr({ form: err });
        return;
      }
      toast("Conta criada. Seja bem-vindo à DTF4U!");
      router.push(back);
    }, 700);
  }

  return (
    <div className="mx-auto grid max-w-6xl items-stretch gap-8 px-4 pt-10 md:px-6 lg:grid-cols-[1fr_1.05fr]">
      <div className="relative hidden overflow-hidden rounded-[2rem] border border-line lg:block">
        <Image src="/images/camisetas-lisas-cores-flatlay.jpg" alt="Camisetas lisas em várias cores" fill sizes="45vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-grape-900/30" />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em]">Sua conta na DTF4U</h2>
          <ul className="mt-6 space-y-4 text-[14.5px] text-soft">
            {[
              [PackageCheck, "Acompanhe cada pedido, do pagamento à entrega"],
              [Repeat, "Repita um pedido anterior com um clique"],
              [Shirt, "Dados e endereço já preenchidos na próxima compra"],
            ].map(([I, t], i) => {
              const Icon = I as typeof Shirt;
              return (
                <li key={i} className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full border border-white/15 bg-ink/40 text-lime-300 backdrop-blur-md">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  {t as string}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="rounded-[2rem] border border-line bg-panel/70 p-6 backdrop-blur-md md:p-10">
        <div className="mb-8 grid grid-cols-2 rounded-full border border-line-strong bg-night p-1" role="tablist">
          {(["entrar", "criar"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`h-10 rounded-full text-[14px] font-semibold transition ${tab === t ? "bg-lime-500 text-ink" : "text-soft hover:text-text"}`}>
              {t === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        {tab === "entrar" ? (
          <form
            className="space-y-5"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              doLogin();
            }}
          >
            <div>
              <h1 className="text-2xl font-bold tracking-[-0.02em]">Que bom ver você de novo</h1>
              <p className="mt-1 text-[14px] text-soft">Entre para ver os seus pedidos e comprar mais rápido.</p>
            </div>
            <Field label="E-mail" error={loginErr.email}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!loginErr.email} />
            </Field>
            <Field label="Senha" error={loginErr.pass}>
              <Password value={pass} onChange={setPass} invalid={!!loginErr.pass} autoComplete="current-password" />
            </Field>
            {loginErr.form && (
              <p className="rounded-2xl border border-danger/40 bg-danger/10 p-3 text-[13.5px] text-danger" role="alert">
                {loginErr.form}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy && <Spinner />} Entrar
            </Button>
            <p className="text-center text-[13px] text-mute">
              Ainda não tem conta?{" "}
              <button type="button" onClick={() => setTab("criar")} className="font-semibold text-lime-300 hover:text-lime-400">
                Criar agora
              </button>
            </p>
          </form>
        ) : (
          <form
            className="space-y-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              doRegister();
            }}
          >
            <div>
              <h1 className="text-2xl font-bold tracking-[-0.02em]">Crie a sua conta</h1>
              <p className="mt-1 text-[14px] text-soft">Leva um minuto e deixa as próximas compras bem mais rápidas.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome completo" error={regErr.name}>
                <Input value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} autoComplete="name" aria-invalid={!!regErr.name} />
              </Field>
              <Field label="Empresa ou marca (opcional)">
                <Input value={reg.company} onChange={(e) => setReg({ ...reg, company: e.target.value })} autoComplete="organization" />
              </Field>
              <Field label="E-mail" error={regErr.email}>
                <Input type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} autoComplete="email" aria-invalid={!!regErr.email} />
              </Field>
              <Field label="Telefone com DDD" error={regErr.phone}>
                <Input value={reg.phone} onChange={(e) => setReg({ ...reg, phone: maskPhone(e.target.value) })} inputMode="tel" autoComplete="tel" aria-invalid={!!regErr.phone} />
              </Field>
              <Field label="CPF ou CNPJ" error={regErr.doc}>
                <Input value={reg.doc} onChange={(e) => setReg({ ...reg, doc: maskDoc(e.target.value) })} inputMode="numeric" aria-invalid={!!regErr.doc} />
              </Field>
              <Field label="Senha" error={regErr.pass} hint="Pelo menos 8 caracteres, com 1 número">
                <Password value={reg.pass} onChange={(v) => setReg({ ...reg, pass: v })} invalid={!!regErr.pass} autoComplete="new-password" />
              </Field>
            </div>
            {regErr.form && (
              <p className="rounded-2xl border border-danger/40 bg-danger/10 p-3 text-[13.5px] text-danger" role="alert">
                {regErr.form}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy && <Spinner />} Criar minha conta
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
