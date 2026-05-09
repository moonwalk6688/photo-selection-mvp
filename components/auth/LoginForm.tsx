"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);
    if (loginError) {
      setError("邮箱或密码不正确");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <label className="block text-sm font-medium text-ink">
        邮箱
        <Input className="mt-2" name="email" type="email" autoComplete="email" required />
      </label>
      <label className="mt-4 block text-sm font-medium text-ink">
        密码
        <Input
          className="mt-2"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      <Button className="mt-6 w-full" type="submit" disabled={loading}>
        {loading ? "登录中..." : "登录"}
      </Button>
    </form>
  );
}
