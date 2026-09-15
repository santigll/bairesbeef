import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { CONTENT_TYPE_BY_EXT, UPLOADS_DIR } from "@/lib/uploads";

// Uploaded photos live under data/uploads (see src/lib/uploads.ts) instead of
// public/uploads, so a single persistent volume at /app/data covers both the
// JSON data files and every uploaded image. This route serves them back at
// the same /uploads/<filename> URL product/settings records already use.
export async function GET(
  _request: Request,
  { params }: RouteContext<"/uploads/[filename]">
) {
  const { filename } = await params;

  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const contentType = CONTENT_TYPE_BY_EXT[ext];
  if (!contentType) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const filePath = path.join(UPLOADS_DIR, filename);
    const data = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
