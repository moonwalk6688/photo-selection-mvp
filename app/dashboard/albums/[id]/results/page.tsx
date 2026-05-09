import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPhotoThumbUrl } from "@/lib/photo-urls";
import type { Album, SelectionWithPhoto } from "@/lib/types";
import { ExportButtons } from "@/components/dashboard/ExportButtons";

export default async function AlbumResultsPage({
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

  const { data: selections, error } = await supabase
    .from("photo_selections")
    .select("*, photos(*)")
    .eq("album_id", id)
    .eq("is_selected", true)
    .order("selected_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (((selections as SelectionWithPhoto[] | null) || []).map((selection) => ({
    ...selection,
    photos: selection.photos
      ? {
          ...selection.photos,
          thumb_url: getPhotoThumbUrl(
            supabase,
            selection.photos.storage_path,
            selection.photos.preview_url
          )
        }
      : null
  })) || []) as SelectionWithPhoto[];
  const albumData = album as Album;

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-line bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href={`/dashboard/albums/${id}`} className="text-sm text-muted hover:text-ink">
              返回相册管理
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-ink">{albumData.title}结果</h1>
            <p className="mt-2 text-sm text-muted">
              已选 {rows.length} / {albumData.max_select_count} 张 ·{" "}
              {albumData.submitted_at
                ? `提交于 ${new Date(albumData.submitted_at).toLocaleString("zh-CN", {
                    hour12: false
                  })}`
                : "客户尚未提交"}
            </p>
          </div>
          <ExportButtons albumId={id} />
        </div>
      </section>

      {rows.length ? (
        <div className="grid gap-3">
          {rows.map((selection, index) => (
            <article key={selection.id} className="rounded-lg border border-line bg-white p-3">
              <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                <div className="aspect-[3/4] overflow-hidden rounded-md bg-black/5">
                  {selection.photos ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selection.photos.thumb_url || selection.photos.preview_url}
                      alt={selection.photos.display_filename}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted">#{index + 1}</p>
                  <h2 className="mt-1 break-all font-semibold text-ink">
                    {selection.photos?.display_filename}
                  </h2>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted">basename</dt>
                      <dd className="break-all font-medium">
                        {selection.photos?.original_basename}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">相机编号</dt>
                      <dd className="font-medium">{selection.photos?.camera_sequence || "-"}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted">客户备注</dt>
                      <dd className="mt-1 rounded-md bg-paper p-3">
                        {selection.client_note || "无备注"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-white p-8 text-center text-sm text-muted">
          暂无选片结果
        </div>
      )}
    </div>
  );
}
