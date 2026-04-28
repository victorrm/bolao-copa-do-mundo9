"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestMagicLink } from "./actions";

interface Props {
  placeholder: string;
  submit: string;
  submitting: string;
}

export function LoginForm({ placeholder, submit, submitting }: Props) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await requestMagicLink(email);
          setMessage(res.message);
        });
      }}
    >
      <Input
        type="email"
        placeholder={placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoFocus
      />
      <Button type="submit" disabled={isPending || !email}>
        {isPending ? submitting : submit}
      </Button>
      {message && (
        <p className="text-sm text-brand-text-muted text-center">{message}</p>
      )}
    </form>
  );
}
