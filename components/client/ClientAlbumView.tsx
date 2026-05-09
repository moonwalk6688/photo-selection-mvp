"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Heart, Lock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Photo } from "@/lib/types";

const PAGE_SIZE = 40;

type PublicAlbum = {
  id: string;
  title: string;
  client_name: string;
  shoot_type: string;
  description: string | null;
  max_select_count: number;
  allow_resubmit: boolean;
  is_submitted: boolean;
  submitted_at: string | null;
  requires_password: boolean;
};

type Pagination = {
  offset: number;
  limit: number;
  total: number;
  has_more: boolean;
};

type Props = {
  token: string;
  initialTitle: string;
  initialDescription: string | null;
  requiresPassword: boolean;
  isSubmitted: boolean;
  allowResubmit: boolean;
};

export function ClientAlbumView({
  token,
  initialTitle,
  initialDescription,
  requiresPassword,
  isSubmitted,
  allowResubmit
}: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [album, setAlbum] = useState<PublicAlbum | null>(() =>
    requiresPassword
      ? null
      : {
          id: "",
          title: initialTitle,
          client_name: "",
          shoot_type: "",
          description: initialDescription,
          max_select_count: 0,
          allow_resubmit: allowResubmit,
          is_submitted: isSubmitted,
          submitted_at: null,
          requires_password: false
        }
  );
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!requiresPassword);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedCount = Object.keys(selected).length;
  const locked = Boolean(album?.is_submitted && !album.allow_resubmit);

  useEffect(() => {
    if (!requiresPassword) {
      loadAlbumPage({ pass: "", offset: 0, reset: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiresPassword]);

  async function loadAlbumPage({
    pass,
    offset,
    reset
  }: {
    pass: string;
    offset: number;
    reset: boolean;
  }) {
    reset ? setLoading(true) : setLoadingMore(true);
    setError("");

    const response = await fetch("/api/public-album", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password: pass,
        offset,
        limit: PAGE_SIZE
      })
    });
    const result = await response.json();
    reset ? setLoading(false) : setLoadingMore(false);

    if (!response.ok) {
      setError(result.error === "Password incorrect" ? "访问密码不正确" : "相册无法访问");
      return;
    }

    setAlbum(result.album);
    setPagination(result.pagination);
    setPhotos((current) => (reset ? result.photos : [...current, ...result.photos]));
    setSelected((current) => ({
      ...current,
      ...Object.fromEntries(
        (result.selections || []).map(
          (selection: { photo_id: string; client_note: string | null }) => [
            selection.photo_id,
            selection.client_note || ""
          ]
        )
      )
    }));
  }

  function loadMore() {
    if (!pagination || loadingMore || !pagination.has_more) return;
    loadAlbumPage({
      pass: password,
      offset: photos.length,
      reset: false
    });
  }

  function onPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadAlbumPage({ pass: password, offset: 0, reset: true });
  }

  function togglePhoto(photoId: string) {
    if (locked) return;
    setSelected((current) => {
      if (current[photoId] !== undefined) {
        const next = { ...current };
        delete next[photoId];
        return next;
      }
      if (Object.keys(current).length >= (album?.max_select_count || 0)) {
        setError(`最多只能选择 ${album?.max_select_count} 张`);
        return current;
      }
      setError("");
      return { ...current, [photoId]: "" };
    });
  }

  function updateNote(photoId: string, note: string) {
    setSelected((current) => ({ ...current, [photoId]: note }));
  }

  async function submitSelections() {
    if (!album || locked) return;
    if (!confirm("确定提交选片吗？提交后摄影师将开始修图。")) return;
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/selections/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password,
        selections: Object.entries(selected).map(([photo_id, client_note]) => ({
          photo_id,
          client_note
        }))
      })
    });
    const result = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(result.error || "提交失败");
      return;
    }

    router.push(`/album/${token}/submitted`);
  }

  const activePhoto = useMemo(
    () => (activeIndex === null ? null : photos[activeIndex]),
    [activeIndex, photos]
  );

  if (requiresPassword && !album) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-5">
        <form
          onSubmit={onPasswordSubmit}
          className="w-full max-w-sm rounded-lg border border-line bg-white p-6 shadow-soft"
        >
          <Lock className="mb-5 text-accent" size={28} />
          <p className="text-sm text-muted">{initialTitle}</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">输入访问密码</h1>
          {initialDescription ? (
            <p className="mt-3 text-sm leading-6 text-muted">{initialDescription}</p>
          ) : null}
          <Input
            className="mt-5"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="访问密码"
            required
          />
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <Button className="mt-5 w-full" type="submit" disabled={loading}>
            {loading ? "验证中..." : "进入相册"}
          </Button>
        </form>
      </main>
    );
  }

  if (loading || !album) {
    return (
      <main className="min-h-screen bg-paper px-5 py-10 text-center text-muted">
        正在加载相册...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper pb-28">
      <header className="px-4 pb-4 pt-6">
        <p className="text-sm text-muted">{album.shoot_type}</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">{album.title}</h1>
        {album.description ? (
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">
            {album.description}
          </p>
        ) : null}
        <div className="mt-4 flex items-center justify-between rounded-md border border-line bg-white px-3 py-3">
          <span className="text-sm text-muted">已选</span>
          <strong className="text-lg text-ink">
            {selectedCount} / {album.max_select_count}
          </strong>
        </div>
        {locked ? (
          <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            选片已提交，当前相册不允许再次修改。
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </header>

      <section className="grid grid-cols-2 gap-2 px-2 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo, index) => {
          const isSelected = selected[photo.id] !== undefined;
          return (
            <article key={photo.id} className="overflow-hidden rounded-md bg-white">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative block aspect-[3/4] w-full overflow-hidden bg-black/5 ${
                  isSelected ? "ring-2 ring-accent" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumb_url || photo.preview_url}
                  alt={photo.display_filename}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <span
                  className={`absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full ${
                    isSelected ? "bg-accent text-white" : "bg-black/40 text-white"
                  }`}
                >
                  {isSelected ? <Check size={18} /> : <Heart size={17} />}
                </span>
              </button>
              <div className="p-2">
                <button
                  type="button"
                  onClick={() => togglePhoto(photo.id)}
                  className={`min-h-9 w-full rounded-md text-xs font-medium ${
                    isSelected ? "bg-ink text-white" : "bg-paper text-ink"
                  }`}
                >
                  {isSelected ? "已选择" : "选择"}
                </button>
                {isSelected ? (
                  <input
                    value={selected[photo.id]}
                    onChange={(event) => updateNote(photo.id, event.target.value)}
                    className="mt-2 min-h-9 w-full rounded-md border border-line px-2 text-xs outline-none focus:border-ink"
                    placeholder="这张备注"
                  />
                ) : null}
                <p className="mt-2 truncate text-[11px] text-muted">{photo.original_basename}</p>
              </div>
            </article>
          );
        })}
      </section>

      {pagination?.has_more ? (
        <div className="px-4 py-6 text-center">
          <Button onClick={loadMore} variant="secondary" disabled={loadingMore}>
            {loadingMore ? "加载中..." : `继续加载照片 ${photos.length} / ${pagination.total}`}
          </Button>
        </div>
      ) : null}

      <footer className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">已选</p>
            <p className="font-semibold text-ink">
              {selectedCount} / {album.max_select_count} 张
            </p>
          </div>
          <Button onClick={submitSelections} disabled={locked || submitting}>
            {submitting ? "提交中..." : "提交选片"}
          </Button>
        </div>
      </footer>

      {activePhoto ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
          <div className="flex min-h-14 items-center justify-between px-3">
            <button
              className="rounded-full p-2"
              onClick={() => setActiveIndex(null)}
              type="button"
            >
              <X size={24} />
            </button>
            <span className="text-sm">
              {activeIndex! + 1} / {pagination?.total || photos.length}
            </span>
            <button
              className="rounded-full p-2"
              onClick={() => togglePhoto(activePhoto.id)}
              type="button"
            >
              {selected[activePhoto.id] !== undefined ? <Check size={24} /> : <Heart size={24} />}
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            <button
              className="absolute left-2 z-10 rounded-full bg-black/40 p-2 disabled:opacity-30"
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex(Math.max(0, activeIndex! - 1))}
              type="button"
            >
              <ChevronLeft />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePhoto.preview_url}
              alt={activePhoto.display_filename}
              className="max-h-full max-w-full object-contain"
              decoding="async"
            />
            <button
              className="absolute right-2 z-10 rounded-full bg-black/40 p-2 disabled:opacity-30"
              disabled={activeIndex === photos.length - 1 && !pagination?.has_more}
              onClick={() => {
                if (activeIndex === photos.length - 1 && pagination?.has_more) {
                  loadMore();
                  return;
                }
                setActiveIndex(Math.min(photos.length - 1, activeIndex! + 1));
              }}
              type="button"
            >
              <ChevronRight />
            </button>
          </div>
          <div className="safe-bottom bg-black px-4 py-3">
            <p className="text-sm">{activePhoto.display_filename}</p>
            {selected[activePhoto.id] !== undefined ? (
              <input
                value={selected[activePhoto.id]}
                onChange={(event) => updateNote(activePhoto.id, event.target.value)}
                className="mt-2 min-h-11 w-full rounded-md border border-white/20 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/50"
                placeholder="给这张照片写备注"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
