import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAlbumPassword } from "@/lib/password";
import { getPhotoThumbUrl } from "@/lib/photo-urls";

const DEFAULT_PAGE_SIZE = 40;
const MAX_PAGE_SIZE = 80;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const token = String(body.token || "");
  const password = String(body.password || "");
  const offset = Math.max(0, Number(body.offset || 0));
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(body.limit || DEFAULT_PAGE_SIZE))
  );

  const supabase = createAdminClient();
  const { data: album } = await supabase
    .from("albums")
    .select("*")
    .eq("share_token", token)
    .single();

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  if (album.expires_at && new Date(album.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Album expired" }, { status: 410 });
  }

  if (!verifyAlbumPassword(password, album.access_password_hash)) {
    return NextResponse.json({ error: "Password incorrect" }, { status: 403 });
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("album_id", album.id)
    .order("sort_order", { ascending: true })
    .order("display_filename", { ascending: true })
    .range(offset, offset + limit - 1);

  const { count: totalPhotos } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("album_id", album.id);

  const { data: selections } = await supabase
    .from("photo_selections")
    .select("photo_id, client_note")
    .eq("album_id", album.id)
    .eq("is_selected", true);

  return NextResponse.json({
    album: {
      id: album.id,
      title: album.title,
      client_name: album.client_name,
      shoot_type: album.shoot_type,
      description: album.description,
      max_select_count: album.max_select_count,
      allow_resubmit: album.allow_resubmit,
      is_submitted: album.is_submitted,
      submitted_at: album.submitted_at,
      requires_password: Boolean(album.access_password_hash)
    },
    photos: (photos || []).map((photo) => ({
      ...photo,
      thumb_url: getPhotoThumbUrl(supabase, photo.storage_path, photo.preview_url)
    })),
    pagination: {
      offset,
      limit,
      total: totalPhotos || 0,
      has_more: offset + limit < (totalPhotos || 0)
    },
    selections: selections || []
  });
}
