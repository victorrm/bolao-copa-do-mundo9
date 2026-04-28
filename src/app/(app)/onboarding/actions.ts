"use server";

import { db, schema } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(2).max(50),
  consent: z.literal(true),
});

export async function completeOnboarding(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, error: "unauthenticated" };

  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const now = Math.floor(Date.now() / 1000);
  await db
    .update(schema.users)
    .set({
      name: parsed.data.name.trim(),
      consentLgpd: 1,
      consentLgpdAt: now,
    })
    .where(eq(schema.users.id, session.user.id));

  redirect("/home");
}
