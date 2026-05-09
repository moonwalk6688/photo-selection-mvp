import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="font-semibold text-ink">
            摄影师选片后台
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/dashboard/albums/new" className="rounded-md px-3 py-2 hover:bg-black/5">
              新建相册
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
