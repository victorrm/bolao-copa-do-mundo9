"use server";

import { db, schema } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/log";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

const Schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function adminLogin(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados inválidos" };

  const email = parsed.data.email.trim().toLowerCase();
  const user = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1).then((r) => r[0]);

  const generic = { ok: false, error: "Credenciais inválidas" } as const;
  if (!user || user.role !== "superadmin" || !user.passwordHash || user.deletedAt) return generic;

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    await logAudit(user.id, "admin.login.failed", user.email);
    return generic;
  }

  const now = Math.floor(Date.now() / 1000);
  await db.update(schema.users).set({ lastLoginAt: now }).where(eq(schema.users.id, user.id));
  await createSession(user.id);
  await logAudit(user.id, "admin.login.success", user.email);

  if (user.passwordMustChange) redirect("/admin/change-password");
  redirect("/admin");
}
