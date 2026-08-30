import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = (await request.json()) as { url?: string };
    if (!url) {
      return NextResponse.json({ title: "", description: "" });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ title: "", description: "" });
    }
    if (!/^https?:$/.test(parsedUrl.protocol)) {
      return NextResponse.json({ title: "", description: "" });
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(6000),
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json({ title: "", description: "" });
    }

    const html = await response.text();

    const ogTitle =
      html.match(
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
      )?.[1] ?? "";
    const twitterTitle =
      html.match(
        /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i
      )?.[1] ?? "";
    const docTitle = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
    const ogDescription =
      html.match(
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
      )?.[1] ?? "";
    const metaDescription =
      html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
      )?.[1] ?? "";

    const decode = (s: string) =>
      s
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .trim();

    const title = decode(ogTitle || twitterTitle || docTitle);
    const description = decode(ogDescription || metaDescription);

    return NextResponse.json({ title, description });
  } catch {
    return NextResponse.json({ title: "", description: "" });
  }
}
