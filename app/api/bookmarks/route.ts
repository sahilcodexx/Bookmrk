import { NextResponse } from "next/server";
import {
  createBookmark,
  deleteBookmarks,
  listBookmarks,
  type NewBookmark,
} from "@/lib/bookmarks";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getServerClient();
    const bookmarks = await listBookmarks(supabase);
    return NextResponse.json({ bookmarks });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await getServerClient();
    const body = (await req.json()) as NewBookmark;
    if (!body.title || !body.href) {
      return NextResponse.json(
        { error: "title and href are required" },
        { status: 400 }
      );
    }
    const bookmark = await createBookmark(supabase, body);
    return NextResponse.json({ bookmark }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await getServerClient();
    const { ids } = (await req.json()) as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ ok: true, deleted: 0 });
    }
    await deleteBookmarks(supabase, ids);
    return NextResponse.json({ ok: true, deleted: ids.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete" },
      { status: 500 }
    );
  }
}
