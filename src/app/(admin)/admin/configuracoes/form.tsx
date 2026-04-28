"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveSettings } from "./actions";

const COLOR_KEYS = ["primary_color", "secondary_color", "accent_color"] as const;
type ColorKey = (typeof COLOR_KEYS)[number];

const COLOR_FIELDS: { key: ColorKey; label: string; hint: string; fallback: string }[] = [
  { key: "primary_color", label: "Cor primária", hint: "Botões, links e elementos principais.", fallback: "#009C3B" },
  { key: "secondary_color", label: "Cor secundária", hint: "Destaques suaves e badges.", fallback: "#FFD500" },
  { key: "accent_color", label: "Cor de destaque", hint: "Foco de inputs e detalhes.", fallback: "#002776" },
];

const TEXT_FIELDS: { key: string; label: string; placeholder?: string }[] = [
  { key: "company_name", label: "Nome da empresa", placeholder: "Ex: Acme Ltda." },
  { key: "logo_url", label: "URL do logo", placeholder: "https://..." },
];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hexToHsl(hex: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let s = 0;
  let hh = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hh = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hh = (b - r) / d + 2; break;
      default: hh = (r - g) / d + 4;
    }
    hh /= 6;
  }
  return `${Math.round(hh * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function hslToHex(hsl: string): string | null {
  const m = /^\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*$/.exec(hsl);
  if (!m) return null;
  const h = clamp(parseFloat(m[1]), 0, 360) / 360;
  const s = clamp(parseFloat(m[2]), 0, 100) / 100;
  const l = clamp(parseFloat(m[3]), 0, 100) / 100;
  function f(t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (s === 0) return l;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  const r = Math.round(f(h + 1 / 3) * 255);
  const g = Math.round(f(h) * 255);
  const b = Math.round(f(h - 1 / 3) * 255);
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function ColorField({
  label,
  hint,
  hex,
  onChange,
}: {
  label: string;
  hint: string;
  hex: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-brand-border bg-brand-card p-1"
          aria-label={`${label} (seletor)`}
        />
        <Input
          value={hex}
          onChange={(e) => {
            const v = e.target.value.trim();
            if (/^#?[0-9a-f]{0,6}$/i.test(v)) onChange(v.startsWith("#") ? v : `#${v}`);
          }}
          className="font-mono uppercase max-w-[140px]"
          maxLength={7}
        />
        <div
          className="h-10 flex-1 rounded-lg border border-brand-border"
          style={{ backgroundColor: hex }}
          aria-hidden
        />
      </div>
      <p className="text-xs text-brand-text-muted">{hint}</p>
    </div>
  );
}

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const colorHex = useMemo(() => {
    const out: Record<ColorKey, string> = { primary_color: "", secondary_color: "", accent_color: "" };
    for (const f of COLOR_FIELDS) {
      const stored = values[f.key]?.trim();
      out[f.key] = (stored && hslToHex(stored)) || f.fallback;
    }
    return out;
  }, [values]);

  function setColor(key: ColorKey, hex: string) {
    const hsl = hexToHsl(hex);
    setValues((v) => ({ ...v, [key]: hsl ?? v[key] ?? "" }));
    setStatus(null);
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus(null);
        startTransition(async () => {
          const res = await saveSettings(values);
          setStatus(res.ok ? { kind: "ok", msg: "Salvo!" } : { kind: "err", msg: "Erro ao salvar" });
        });
      }}
    >
      {TEXT_FIELDS.map((f) => (
        <div key={f.key} className="flex flex-col gap-1">
          <label className="text-sm font-medium">{f.label}</label>
          <Input
            value={values[f.key] ?? ""}
            placeholder={f.placeholder}
            onChange={(e) => {
              setValues((v) => ({ ...v, [f.key]: e.target.value }));
              setStatus(null);
            }}
          />
        </div>
      ))}

      <div className="border-t border-brand-border pt-4">
        <h2 className="text-sm font-semibold mb-3">Cores da marca</h2>
        <div className="flex flex-col gap-4">
          {COLOR_FIELDS.map((f) => (
            <ColorField
              key={f.key}
              label={f.label}
              hint={f.hint}
              hex={colorHex[f.key]}
              onChange={(hex) => setColor(f.key, hex)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando…" : "Salvar"}
        </Button>
        {status && (
          <span className={`text-sm ${status.kind === "ok" ? "text-emerald-600" : "text-red-500"}`}>
            {status.msg}
          </span>
        )}
      </div>
    </form>
  );
}
