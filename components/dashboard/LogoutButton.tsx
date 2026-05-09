"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 hover:bg-black/5"
      type="button"
    >
      <LogOut size={16} />
      退出
    </button>
  );
}
