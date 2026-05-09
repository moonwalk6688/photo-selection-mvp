"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { hashAlbumPassword } from "@/lib/password";
import { createShareToken } from "@/lib/tokens";

export async function createAlbumAction(formData: FormData) {
  const { user, supabase } = await requireUser();
  const client_name = String(formData.get("client_name") || "").trim();
  const shoot_type = String(formData.get("shoot_type") || "").trim();
  const shoot_date = String(formData.get("shoot_date") || "") || null;
  const max_select_count = Number(formData.get("max_select_count") || 30);
  const description = String(formData.get("description") || "").trim() || null;
  const accessPassword = String(formData.get("access_password") || "");
  const allow_resubmit = formData.get("allow_resubmit") === "on";

  if (!client_name || !shoot_type) {
    throw new Error("客户名称和拍摄类型不能为空");
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    display_name: user.email
  });

  const title = `${client_name}选片`;
  const { data, error } = await supabase
    .from("albums")
    .insert({
      photographer_id: user.id,
      client_name,
      shoot_type,
      shoot_date,
      title,
      description,
      max_select_count,
      access_password_hash: hashAlbumPassword(accessPassword),
      allow_resubmit,
      share_token: createShareToken()
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/albums/${data.id}`);
}
