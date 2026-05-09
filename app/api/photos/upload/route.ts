import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { getStorageBucket } from "@/lib/env";
import { parsePhotoFilename, isSupportedJpeg } from "@/lib/filename";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const albumId = String(formData.get("album_id") || "");
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (!albumId || files.length === 0) {
    return NextResponse.json({ error: "Missing album or files" }, { status: 400 });
  }

  const { data: album } = await supabase
    .from("albums")
    .select("id, photographer_id")
    .eq("id", albumId)
    .eq("photographer_id", user.id)
    .single();

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const bucket = getStorageBucket();
  const { count } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("album_id", albumId);
  const baseSortOrder = count || 0;
  const inserted = [];

  for (const [index, file] of files.entries()) {
    if (!isSupportedJpeg(file.name, file.type)) {
      continue;
    }

    const parsed = parsePhotoFilename(file.name);
    const photoId = randomUUID();
    const storagePath = `albums/${albumId}/previews/${photoId}.jpg`;
    const thumbPath = `albums/${albumId}/thumbs/${photoId}.webp`;
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const previewBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({
        width: 2000,
        height: 2000,
        fit: "inside",
        withoutEnlargement: true
      })
      .jpeg({
        quality: 78,
        mozjpeg: true
      })
      .toBuffer();
    const thumbBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({
        width: 640,
        height: 640,
        fit: "inside",
        withoutEnlargement: true
      })
      .webp({
        quality: 68
      })
      .toBuffer();

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, previewBuffer, {
        contentType: "image/jpeg",
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { error: thumbUploadError } = await supabase.storage
      .from(bucket)
      .upload(thumbPath, thumbBuffer, {
        contentType: "image/webp",
        upsert: false
      });

    if (thumbUploadError) {
      await supabase.storage.from(bucket).remove([storagePath]);
      return NextResponse.json({ error: thumbUploadError.message }, { status: 500 });
    }

    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    const { data: photo, error: insertError } = await supabase
      .from("photos")
      .insert({
        id: photoId,
        album_id: albumId,
        display_filename: parsed.display_filename,
        original_basename: parsed.original_basename,
        camera_sequence: parsed.camera_sequence,
        preview_url: publicUrl.publicUrl,
        storage_path: storagePath,
        sort_order: baseSortOrder + index
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    inserted.push(photo);
  }

  return NextResponse.json({ photos: inserted });
}
