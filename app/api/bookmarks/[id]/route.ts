import { NextResponse } from "next/server";
import {
  deleteBookmark,
  updateBookmark,
  type BookmarkUpdate,
} from "@/lib/bookmarks";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await getServerClient();
    const body = (await req.json()) as BookmarkUpdate;
    const bookmark = await updateBookmark(supabase, id, body);
    return NextResponse.json({ bookmark });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await getServerClient();
    await deleteBookmark(supabase, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete" },
      { status: 500 }
    );
  }
}
