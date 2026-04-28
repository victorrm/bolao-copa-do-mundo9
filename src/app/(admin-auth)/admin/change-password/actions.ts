"use server";

import { db, schema } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit/log";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

const Schema = z.object({ current: z.string().min(8), next: z.string().min(12) });

export async function changePassword(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "superadmin") return { ok: false, error: "forbidden" };

  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados inválidos" };

  if (!session.user.passwordHash) return { ok: false, error: "Sem senha cadastrada" };
  const valid = await verifyPassword(parsed.data.current, session.user.passwordHash);
  if (!valid) return { ok: false, error: "Senha atual incorreta" };

  const newHash = await hashPassword(parsed.data.next);
  await db.update(schema.users).set({ passwordHash: newHash, passwordMustChange: 0 }).where(eq(schema.users.id, session.user.id));
  await logAudit(session.user.id, "admin.password.change");
  redirect("/admin");
}
