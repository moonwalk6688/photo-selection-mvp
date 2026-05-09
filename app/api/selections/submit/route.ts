import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAlbumPassword } from "@/lib/password";

type IncomingSelection = {
  photo_id: string;
  client_note?: string;
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const token = String(body.token || "");
  const password = String(body.password || "");
  const selections = Array.isArray(body.selections)
    ? (body.selections as IncomingSelection[])
    : [];

  const supabase = createAdminClient();
  const { data: album } = await supabase
    .from("albums")
    .select("*")
    .eq("share_token", token)
    .single();

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  if (album.is_submitted && !album.allow_resubmit) {
    return NextResponse.json({ error: "Selection already submitted" }, { status: 409 });
  }

  if (!verifyAlbumPassword(password, album.access_password_hash)) {
    return NextResponse.json({ error: "Password incorrect" }, { status: 403 });
  }

  const uniqueSelections = Array.from(
    new Map(selections.map((selection) => [selection.photo_id, selection])).values()
  );

  if (uniqueSelections.length > album.max_select_count) {
    return NextResponse.json(
      { error: `最多只能选择 ${album.max_select_count} 张` },
      { status: 400 }
    );
  }

  const photoIds = uniqueSelections.map((selection) => selection.photo_id);
  const { data: validPhotos } = await supabase
    .from("photos")
    .select("id")
    .eq("album_id", album.id)
    .in("id", photoIds.length ? photoIds : ["00000000-0000-0000-0000-000000000000"]);

  if ((validPhotos || []).length !== uniqueSelections.length) {
    return NextResponse.json({ error: "Invalid photo selection" }, { status: 400 });
  }

  await supabase.from("photo_selections").delete().eq("album_id", album.id);

  if (uniqueSelections.length) {
    const rows = uniqueSelections.map((selection) => ({
      album_id: album.id,
      photo_id: selection.photo_id,
      is_selected: true,
      client_note: String(selection.client_note || "").trim() || null,
      selected_at: new Date().toISOString()
    }));

    const { error } = await supabase.from("photo_selections").insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  await supabase
    .from("albums")
    .update({
      is_submitted: true,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", album.id);

  return NextResponse.json({ ok: true });
}
