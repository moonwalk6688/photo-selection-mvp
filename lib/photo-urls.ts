import { getStorageBucket } from "@/lib/env";

type PublicUrlClient = {
  storage: {
    from: (bucket: string) => {
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
};

export function getPhotoThumbPath(storagePath: string) {
  if (!storagePath.includes("/previews/")) return null;
  return storagePath
    .replace("/previews/", "/thumbs/")
    .replace(/\.(jpg|jpeg|webp)$/i, ".webp");
}

export function getPhotoThumbUrl(
  supabase: PublicUrlClient,
  storagePath: string,
  fallbackUrl: string
) {
  const thumbPath = getPhotoThumbPath(storagePath);
  if (!thumbPath) return fallbackUrl;
  return supabase.storage.from(getStorageBucket()).getPublicUrl(thumbPath).data.publicUrl;
}
