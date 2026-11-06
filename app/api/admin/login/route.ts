import { checkPassword, clearFailures, createSession, recordFailure, tooManyAttempts, adminConfigured } from "../../../lib/auth";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return Response.json({ error: "Admin is not set up yet. Add ADMIN_PASSWORD in Vercel." }, { status: 503 });
  }
  const key = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooManyAttempts(key)) {
    return Response.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  let password = "";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  if (!checkPassword(password)) {
    recordFailure(key);
    await new Promise((r) => setTimeout(r, 800));
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }

  clearFailures(key);
  await createSession();
  return Response.json({ ok: true });
}
