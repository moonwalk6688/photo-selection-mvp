import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStorageBucket } from "@/lib/env";
import { getPhotoThumbPath } from "@/lib/photo-urls";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: photo } = await supabase
    .from("photos")
    .select("id, storage_path, albums!inner(photographer_id)")
    .eq("id", id)
    .eq("albums.photographer_id", user.id)
    .single();

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const pathsToRemove = [photo.storage_path];
  const thumbPath = getPhotoThumbPath(photo.storage_path);
  if (thumbPath) pathsToRemove.push(thumbPath);
  await supabase.storage.from(getStorageBucket()).remove(pathsToRemove);
  const { error } = await supabase.from("photos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
