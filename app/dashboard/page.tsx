import Link from "next/link";
import { Camera, CheckCircle2, Clock, ImageIcon } from "lucide-react";
import { requireUser } from "@/lib/auth";
import type { Album } from "@/lib/types";

type AlbumRow = Album & {
  photos: { count: number }[];
  photo_selections: { count: number }[];
};

export default async function DashboardPage() {
  const { supabase } = await requireUser();
  const { data: albums, error } = await supabase
    .from("albums")
    .select("*, photos(count), photo_selections(count)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">全部客户相册</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">选片工作台</h1>
        </div>
        <Link
          href="/dashboard/albums/new"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-medium text-white"
        >
          创建客户相册
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {(albums as AlbumRow[] | null)?.length ? (
          (albums as AlbumRow[]).map((album) => (
            <Link
              key={album.id}
              href={`/dashboard/albums/${album.id}`}
              className="rounded-lg border border-line bg-white p-4 shadow-sm transition hover:border-ink"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-ink">{album.client_name}</h2>
                    <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-muted">
                      {album.shoot_type}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
                        album.is_submitted
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {album.is_submitted ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                      {album.is_submitted ? "已提交" : "未提交"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    拍摄日期 {album.shoot_date || "未填写"} · 创建于{" "}
                    {new Date(album.created_at).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-56">
                  <div className="rounded-md bg-paper px-3 py-2">
                    <span className="flex items-center gap-1 text-muted">
                      <ImageIcon size={15} /> 照片
                    </span>
                    <strong className="mt-1 block text-lg">{album.photos?.[0]?.count || 0}</strong>
                  </div>
                  <div className="rounded-md bg-paper px-3 py-2">
                    <span className="flex items-center gap-1 text-muted">
                      <Camera size={15} /> 已选
                    </span>
                    <strong className="mt-1 block text-lg">
                      {album.photo_selections?.[0]?.count || 0}
                    </strong>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center">
            <p className="text-muted">还没有相册</p>
            <Link
              href="/dashboard/albums/new"
              className="mt-4 inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-sm font-medium text-white"
            >
              创建第一个客户相册
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
