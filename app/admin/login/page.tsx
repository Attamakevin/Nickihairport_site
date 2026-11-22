"use client";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "../actions";
import Logo from "@/components/Logo";

function Submit() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="btn btn-gold w-full">{pending ? "Signing in…" : "Sign in"}</button>;
}

export default function Login() {
  const [state, action] = useFormState(loginAction, undefined);
  return (
    <div className="mx-auto mt-16 max-w-md">
      <div className="mb-8 flex justify-center"><Logo size="lg" /></div>
      <form action={action} className="card space-y-5 p-8">
        <h1 className="font-display text-2xl">Admin sign in</h1>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="input" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required minLength={8} autoComplete="current-password" className="input" /></div>
        {state?.error && <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{state.error}</p>}
        <Submit />
      </form>
    </div>
  );
}
