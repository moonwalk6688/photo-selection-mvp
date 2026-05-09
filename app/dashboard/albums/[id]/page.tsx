import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getSiteUrl } from "@/lib/env";
import { getPhotoThumbUrl } from "@/lib/photo-urls";
import type { Album, Photo } from "@/lib/types";
import { PhotoUploader } from "@/components/dashboard/PhotoUploader";
import { PhotoGridManager } from "@/components/dashboard/PhotoGridManager";
import { CopyLinkButton } from "@/components/dashboard/CopyLinkButton";

export default async function AlbumManagePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data: album } = await supabase.from("albums").select("*").eq("id", id).single();

  if (!album) {
    notFound();
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("album_id", id)
    .order("sort_order", { ascending: true })
    .order("display_filename", { ascending: true });

  const albumData = album as Album;
  const photoRows = ((photos as Photo[] | null) || []).map((photo) => ({
    ...photo,
    thumb_url: getPhotoThumbUrl(supabase, photo.storage_path, photo.preview_url)
  }));
  const clientUrl = `${getSiteUrl()}/album/${albumData.share_token}`;

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-line bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-muted">{albumData.shoot_type}</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">{albumData.title}</h1>
            <p className="mt-2 text-sm text-muted">
              客户：{albumData.client_name} · 最多可选 {albumData.max_select_count} 张 ·{" "}
              {albumData.is_submitted ? "客户已提交" : "客户未提交"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton url={clientUrl} />
            <Link
              href={`/dashboard/albums/${id}/results`}
              className="inline-flex min-h-10 items-center rounded-md bg-ink px-3 text-sm font-medium text-white"
            >
              查看选片结果
            </Link>
          </div>
        </div>
        <div className="mt-4 rounded-md bg-paper p-3 text-sm text-muted">
          <span className="break-all">{clientUrl}</span>
        </div>
      </section>

      <PhotoUploader albumId={id} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-ink">已上传照片</h2>
          <span className="text-sm text-muted">{photoRows.length} 张</span>
        </div>
        <PhotoGridManager photos={photoRows} />
      </section>
    </div>
  );
}
