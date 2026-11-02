"use client";

import { CheckCircle2, FileText, ImageIcon, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { fileSize } from "@/lib/format";
import { uid } from "@/lib/store";
import type { ArtFile } from "@/lib/types";

const MAX_FILES = 10;
const MAX_MB = 50;
const ACCEPT = ["image/png", "application/pdf", "image/jpeg", "image/svg+xml"];
const EXT = /\.(png|pdf|jpe?g|svg)$/i;

interface Item extends ArtFile {
  progress: number;
}

function thumb(file: File): Promise<string | undefined> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.size > 8 * 1024 * 1024) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const s = 96 / Math.max(img.width, img.height);
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * s));
      c.height = Math.max(1, Math.round(img.height * s));
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
    img.src = url;
  });
}

export function ArtUpload({ value, onChange, error }: { value: ArtFile[]; onChange: (files: ArtFile[]) => void; error?: string }) {
  const [items, setItems] = useState<Item[]>(() => value.map((v) => ({ ...v, progress: 100 })));
  const [drag, setDrag] = useState(false);
  const [problem, setProblem] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(() => () => timers.current.forEach((t) => window.clearInterval(t)), []);

  const done = (list: Item[]) => onChangeRef.current(list.filter((i) => i.progress >= 100).map((i) => ({ id: i.id, name: i.name, size: i.size, type: i.type, preview: i.preview })));

  async function add(files: FileList | File[]) {
    setProblem("");
    const arr = Array.from(files);
    const room = MAX_FILES - items.length;
    if (room <= 0) {
      setProblem(`Você já enviou ${MAX_FILES} arquivos, o máximo por produto.`);
      return;
    }
    const rejected: string[] = [];
    const ok = arr.filter((f) => {
      if (!(ACCEPT.includes(f.type) || EXT.test(f.name))) {
        rejected.push(`${f.name} não é PNG, PDF, JPG ou SVG`);
        return false;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        rejected.push(`${f.name} passa de ${MAX_MB} MB`);
        return false;
      }
      return true;
    });
    if (ok.length > room) rejected.push(`Só cabem mais ${room} ${room === 1 ? "arquivo" : "arquivos"} neste produto`);
    if (rejected.length) setProblem(rejected.join(". ") + ".");
    const chosen = ok.slice(0, room);
    const fresh: Item[] = await Promise.all(
      chosen.map(async (f) => ({ id: uid(), name: f.name, size: f.size, type: f.type || "application/octet-stream", preview: await thumb(f), progress: 0 })),
    );
    setItems((cur) => [...cur, ...fresh]);
    for (const it of fresh) {
      const step = Math.max(6, Math.round(2400000 / Math.max(it.size, 300000)));
      const t = window.setInterval(() => {
        setItems((cur) => {
          const next = cur.map((c) => (c.id === it.id ? { ...c, progress: Math.min(100, c.progress + step) } : c));
          const me = next.find((c) => c.id === it.id);
          if (!me || me.progress >= 100) {
            window.clearInterval(t);
            queueMicrotask(() => done(next));
          }
          return next;
        });
      }, 90);
      timers.current.push(t);
    }
  }

  function remove(id: string) {
    setItems((cur) => {
      const next = cur.filter((c) => c.id !== id);
      queueMicrotask(() => done(next));
      return next;
    });
  }

  const shownError = problem || error;
  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files.length) add(e.dataTransfer.files);
        }}
        className={`relative rounded-2xl border-2 border-dashed p-5 text-center transition ${drag ? "border-lime-400 bg-lime-500/10" : shownError ? "border-danger/60 bg-danger/5" : "border-line-strong bg-night/60 hover:border-white/30"}`}
      >
        <UploadCloud className={`mx-auto size-8 ${drag ? "text-lime-300" : "text-mute"}`} aria-hidden />
        <p className="mt-2 text-[14px] font-medium">
          Arraste a sua arte aqui ou{" "}
          <button type="button" onClick={() => input.current?.click()} className="font-semibold text-lime-300 underline-offset-4 hover:underline">
            selecione o arquivo
          </button>
        </p>
        <p className="mt-1 text-[12.5px] text-mute">
          PNG com fundo transparente, PDF, JPG ou SVG · até {MAX_MB} MB cada · {items.length} de {MAX_FILES}
        </p>
        <input
          ref={input}
          type="file"
          multiple
          accept=".png,.pdf,.jpg,.jpeg,.svg"
          className="sr-only"
          aria-label="Enviar arte"
          onChange={(e) => {
            if (e.target.files?.length) add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {shownError && (
        <p className="mt-2 text-[12.5px] text-danger" role="alert">
          {shownError}
        </p>
      )}
      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-3 rounded-xl border border-line bg-night/70 p-2.5 animate-rise">
              <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-[repeating-conic-gradient(#2a2433_0%_25%,#1f1b26_0%_50%)] bg-[length:12px_12px]">
                {it.preview ? <Image src={it.preview} alt="" width={44} height={44} unoptimized className="size-11 object-contain" /> : it.type === "application/pdf" ? <FileText className="size-5 text-soft" aria-hidden /> : <ImageIcon className="size-5 text-soft" aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium">{it.name}</span>
                {it.progress < 100 ? (
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/8" role="progressbar" aria-valuenow={it.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Enviando ${it.name}`}>
                    <span className="block h-full rounded-full bg-lime-500 transition-[width] duration-100" style={{ width: `${it.progress}%` }} />
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[12px] text-lime-300">
                    <CheckCircle2 className="size-3.5" aria-hidden /> Enviado · {fileSize(it.size)}
                  </span>
                )}
              </span>
              <button type="button" onClick={() => remove(it.id)} className="grid size-8 shrink-0 place-items-center rounded-full text-mute hover:bg-danger/10 hover:text-danger" aria-label={`Remover ${it.name}`}>
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
