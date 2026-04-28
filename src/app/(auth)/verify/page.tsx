import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { hashToken } from "@/lib/auth/tokens";
import { createSession } from "@/lib/auth/session";
import { nanoid } from "nanoid";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const token = params.token;
  if (!token) redirect("/login?error=missing-token");

  const tokenHash = hashToken(token);
  const now = Math.floor(Date.now() / 1000);

  const link = await db
    .select()
    .from(schema.magicLinks)
    .where(eq(schema.magicLinks.tokenHash, tokenHash))
    .limit(1)
    .then((r) => r[0]);

  if (!link || link.usedAt || link.expiresAt < now) {
    redirect("/login?error=invalid-token");
  }

  await db
    .update(schema.magicLinks)
    .set({ usedAt: now })
    .where(eq(schema.magicLinks.tokenHash, tokenHash));

  const email = link.email;
  let user = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1).then((r) => r[0]);
  if (!user) {
    const id = nanoid(21);
    await db.insert(schema.users).values({
      id,
      email,
      role: "participant",
      createdAt: now,
      lastLoginAt: now,
    });
    user = (await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1))[0]!;
  } else {
    await db.update(schema.users).set({ lastLoginAt: now }).where(eq(schema.users.id, user.id));
  }

  await createSession(user.id);

  if (user.role === "superadmin") {
    if (user.passwordMustChange) redirect("/admin/change-password");
    redirect("/admin");
  }

  if (!user.consentLgpd || !user.name) {
    redirect("/onboarding");
  }
  redirect("/home");
}
