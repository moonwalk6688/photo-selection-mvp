import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";

export default function HomePage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-10">
        <section className="w-full max-w-xl rounded-lg border border-line bg-white p-6 shadow-soft">
          <p className="text-sm text-muted">本地开发环境</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">需要配置 Supabase</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            项目已经可以运行。继续使用登录、相册、上传和客户选片功能前，请先创建
            <span className="mx-1 font-medium text-ink">.env.local</span>
            并填写 Supabase URL、Anon Key、Service Role Key。
          </p>
          <pre className="mt-5 overflow-x-auto rounded-md bg-paper p-4 text-xs leading-6 text-ink">
{`NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PHOTO_PASSWORD_SECRET=change-this-long-random-secret
SUPABASE_STORAGE_BUCKET=photo-previews`}
          </pre>
          <p className="mt-4 text-sm text-muted">
            数据库脚本在 db/schema.sql、db/policies.sql、db/storage-policies.sql。
          </p>
        </section>
      </main>
    );
  }

  redirect("/dashboard");
}
