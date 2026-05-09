import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-10">
      <section className="w-full max-w-sm">
        <div className="mb-8">
          <p className="text-sm text-muted">摄影师后台</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink">登录选片系统</h1>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
