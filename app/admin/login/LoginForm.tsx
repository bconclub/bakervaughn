"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn, type LoginState } from "../actions";

const input =
  "mt-1.5 w-full rounded-[2px] border border-line bg-ground px-3 py-2.5 text-text outline-none focus:border-lamp";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="mt-8 space-y-5">
      <label className="block text-sm text-text-2">
        Username or email
        <input
          name="login"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          className={input}
        />
      </label>
      <label className="block text-sm text-text-2">
        Password
        <span className="relative block">
          <input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${input} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute top-1/2 right-1 mt-[3px] grid size-9 -translate-y-1/2 place-items-center text-text-3 hover:text-text"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </span>
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
