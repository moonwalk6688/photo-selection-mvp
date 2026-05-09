"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Photo } from "@/lib/types";

export function PhotoGridManager({ photos }: { photos: Photo[] }) {
  const router = useRouter();

  async function removePhoto(id: string) {
    if (!confirm("确定删除这张小样吗？")) return;
    await fetch(`/api/photos/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (!photos.length) {
    return (
      <div className="rounded-lg border border-line bg-white p-8 text-center text-sm text-muted">
        还没有上传照片
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {photos.map((photo) => (
        <div key={photo.id} className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="aspect-[3/4] bg-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumb_url || photo.preview_url}
              alt={photo.display_filename}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-2">
            <p className="truncate text-xs font-medium">{photo.display_filename}</p>
            <p className="mt-1 truncate text-xs text-muted">{photo.original_basename}</p>
            <button
              onClick={() => removePhoto(photo.id)}
              className="mt-2 inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-xs text-red-600 hover:bg-red-50"
              type="button"
            >
              <Trash2 size={13} />
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
