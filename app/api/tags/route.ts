import { NextResponse } from "next/server";
import {
  createCustomTag,
  deleteCustomTag,
  listCustomTags,
  type BookmarkKind,
} from "@/lib/bookmarks";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getServerClient();
    const tags = await listCustomTags(supabase);
    return NextResponse.json({ tags });
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
    const body = (await req.json()) as {
      label: string;
      color: string;
      kind: BookmarkKind;
    };
    if (!body.label || !body.color || !body.kind) {
      return NextResponse.json(
        { error: "label, color, and kind are required" },
        { status: 400 }
      );
    }
    const tag = await createCustomTag(supabase, body);
    return NextResponse.json({ tag }, { status: 201 });
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
    const { id } = (await req.json()) as { id: string };
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await deleteCustomTag(supabase, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete" },
      { status: 500 }
    );
  }
}
