import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

// Called by the API after a product change commits (openspec
// product-images-and-showcase D14). `{ expire: 0 }` rather than "max": the
// next visitor — often the seller checking their edit — must get fresh data,
// and the re-fetch is cheap because the API answers from Redis.
const TAG = /^(products|categories|sellers|product:[\w-]+|seller:[\w-]+)$/;

const sameSecret = (given: string, expected: string) => {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.headers.get("x-revalidate-secret") ?? "";
  if (!secret || !sameSecret(given, secret)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    tags?: unknown;
  } | null;
  const tags = Array.isArray(body?.tags) ? body.tags : null;
  if (
    !tags?.length ||
    tags.length > 20 ||
    !tags.every((tag) => typeof tag === "string" && TAG.test(tag))
  ) {
    return Response.json({ error: "invalid tags" }, { status: 400 });
  }

  for (const tag of tags as string[]) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tags });
}
