import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";
import type { SelectionWithPhoto } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const { albumId } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: album } = await supabase
    .from("albums")
    .select("id, client_name")
    .eq("id", albumId)
    .eq("photographer_id", user.id)
    .single();

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const { data: selections, error } = await supabase
    .from("photo_selections")
    .select("*, photos(*)")
    .eq("album_id", albumId)
    .eq("is_selected", true)
    .order("selected_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = [
    ["序号", "小样文件名", "basename", "相机编号", "客户备注", "提交时间"],
    ...((selections as SelectionWithPhoto[] | null) || []).map((selection, index) => [
      index + 1,
      selection.photos?.display_filename,
      selection.photos?.original_basename,
      selection.photos?.camera_sequence,
      selection.client_note,
      selection.selected_at
        ? new Date(selection.selected_at).toLocaleString("zh-CN", { hour12: false })
        : ""
    ])
  ];

  const csv = `\uFEFF${toCsv(rows)}`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(album.client_name)}-选片结果.csv"`
    }
  });
}
