import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ClientAlbumView } from "@/components/client/ClientAlbumView";

export default async function PublicAlbumPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();
  const { data: album } = await supabase
    .from("albums")
    .select("title, description, access_password_hash, is_submitted, allow_resubmit")
    .eq("share_token", token)
    .single();

  if (!album) {
    notFound();
  }

  return (
    <ClientAlbumView
      token={token}
      initialTitle={album.title}
      initialDescription={album.description}
      requiresPassword={Boolean(album.access_password_hash)}
      isSubmitted={album.is_submitted}
      allowResubmit={album.allow_resubmit}
    />
  );
}
