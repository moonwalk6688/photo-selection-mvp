"use client";

import { ChangeEvent, useState } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function PhotoUploader({ albumId }: { albumId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setLoading(true);
    setMessage(`正在上传 ${files.length} 张小样...`);

    const formData = new FormData();
    formData.set("album_id", albumId);
    files.forEach((file) => formData.append("files", file));

    const response = await fetch("/api/photos/upload", {
      method: "POST",
      body: formData
    });
    const result = await response.json();
    setLoading(false);
    event.target.value = "";

    if (!response.ok) {
      setMessage(result.error || "上传失败");
      return;
    }

    setMessage(`已上传 ${result.photos.length} 张 JPG 小样`);
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-dashed border-line bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-ink">批量上传 JPG 小样</h2>
          <p className="mt-1 text-sm text-muted">
            系统会保留原始文件名，并解析 basename 和相机编号。
          </p>
        </div>
        <label>
          <input
            className="hidden"
            type="file"
            multiple
            accept="image/jpeg,.jpg,.jpeg"
            onChange={upload}
            disabled={loading}
          />
          <span className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-white">
            <Upload size={16} />
            选择小样
          </span>
        </label>
      </div>
      {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}
    </div>
  );
}
