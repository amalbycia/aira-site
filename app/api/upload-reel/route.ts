import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for uploading a reel to Bunny Stream.
 *
 * This keeps the Bunny library key OFF the client — the Studio upload component
 * (sanity/components/BunnyVideoUpload.tsx) POSTs the raw video file here, and we
 * run Bunny's two-step flow server-side:
 *
 *   1. POST   /library/{lib}/videos        (JSON {title}) → returns { guid }
 *   2. PUT    /library/{lib}/videos/{guid} (raw bytes, application/octet-stream)
 *
 * IMPORTANT: the PUT body must be RAW BINARY with content-type octet-stream.
 * A multipart/form body returns HTTP 400 "Failed to read the request form".
 *
 * Returns { guid } on success; the component writes that into the reel doc's
 * `bunnyVideoId` field. Bunny then transcodes asynchronously.
 */

const BUNNY_API = "https://video.bunnycdn.com";

// Allow large request bodies and give Bunny time to accept the upload.
export const runtime = "nodejs";
export const maxDuration = 300; // seconds (Vercel function cap; raise plan if needed)

export async function POST(req: NextRequest) {
  const LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID;
  const API_KEY = process.env.BUNNY_STREAM_API_KEY;

  if (!LIBRARY_ID || !API_KEY) {
    return NextResponse.json(
      { error: "Bunny Stream is not configured on the server." },
      { status: 500 },
    );
  }

  // The title comes through a query param so the body stays a clean raw file.
  const title =
    req.nextUrl.searchParams.get("title")?.slice(0, 200) || "Untitled reel";

  // The file is the raw request body (the component sends the File directly).
  const body = req.body;
  if (!body) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  try {
    // ── Step 1: create the video object, get its GUID ──────────────────────
    const createRes = await fetch(`${BUNNY_API}/library/${LIBRARY_ID}/videos`, {
      method: "POST",
      headers: {
        AccessKey: API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (!createRes.ok) {
      const text = await createRes.text();
      return NextResponse.json(
        { error: `Bunny create failed: ${createRes.status} ${text}` },
        { status: 502 },
      );
    }

    const created = (await createRes.json()) as { guid?: string };
    const guid = created.guid;
    if (!guid) {
      return NextResponse.json(
        { error: "Bunny did not return a video id." },
        { status: 502 },
      );
    }

    // ── Step 2: stream the raw file bytes to Bunny (octet-stream) ───────────
    const uploadRes = await fetch(
      `${BUNNY_API}/library/${LIBRARY_ID}/videos/${guid}`,
      {
        method: "PUT",
        headers: {
          AccessKey: API_KEY,
          "content-type": "application/octet-stream",
        },
        body,
        // Required by undici/Node fetch when streaming a request body.
        // @ts-expect-error -- duplex is valid at runtime, missing from types.
        duplex: "half",
      },
    );

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      return NextResponse.json(
        { error: `Bunny upload failed: ${uploadRes.status} ${text}` },
        { status: 502 },
      );
    }

    return NextResponse.json({ guid });
  } catch (err) {
    return NextResponse.json(
      { error: `Upload error: ${(err as Error).message}` },
      { status: 500 },
    );
  }
}
