import { isAdmin } from "../../../lib/auth";
import { saveImage } from "../../../lib/uploads";

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Not signed in." }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });
    const url = await saveImage(file);
    return Response.json({ url });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Upload failed." }, { status: 400 });
  }
}
