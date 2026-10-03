"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "../actions";

const input =
  "mt-1.5 w-full rounded-[2px] border border-line bg-ground px-3 py-2.5 text-text outline-none focus:border-lamp";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  return (
    <form action={action} className="mt-8 space-y-5">
      <label className="block text-sm text-text-2">
        Email
        <input name="email" type="email" autoComplete="email" required className={input} />
      </label>
      <label className="block text-sm text-text-2">
        Password
        <input name="password" type="password" autoComplete="current-password" required className={input} />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-[oklch(72%_0.15_29)]">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="h-12 w-full rounded-full bg-lamp font-semibold text-ink transition-colors hover:bg-[oklch(84%_0.14_70)] disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
