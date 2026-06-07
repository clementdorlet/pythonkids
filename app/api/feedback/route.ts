import { Resend } from "resend";
import { updateData } from "@/lib/serverStorage";

interface FeedbackEntry {
  name?: string;
  message: string;
  page?: string;
  date: string;
}

const MAX_ENTRIES = 500;

export async function POST(request: Request) {
  const { name, message, page } = await request.json() as {
    name?: string;
    message: string;
    page?: string;
  };

  if (!message?.trim()) {
    return Response.json({ error: "Message vide" }, { status: 400 });
  }

  // Sans clé Resend (mode « tout gratuit » / stores) : on stocke dans DATA_DIR/feedback.json
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_VOTRE")) {
    await updateData<FeedbackEntry[]>("feedback.json", [], (list) => {
      list.push({
        name: name?.trim().slice(0, 50) || undefined,
        message: message.trim().slice(0, 2000),
        page: page?.slice(0, 200),
        date: new Date().toISOString(),
      });
      if (list.length > MAX_ENTRIES) list.splice(0, list.length - MAX_ENTRIES);
      return list;
    });
    return Response.json({ ok: true });
  }

  const resend = new Resend(apiKey);
  try {
    await resend.emails.send({
      from: "PythonKids Feedback <onboarding@resend.dev>",
      to: "cyril.dorlet@gmail.com",
      subject: `💬 Nouveau commentaire PythonKids${name ? ` de ${name}` : ""}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;background:#f8f9fa;border-radius:12px">
          <h2 style="margin:0 0 16px;color:#7c3aed">💬 Nouveau commentaire sur PythonKids</h2>
          ${name ? `<p style="margin:0 0 8px"><strong>Nom :</strong> ${name}</p>` : ""}
          ${page ? `<p style="margin:0 0 8px"><strong>Page :</strong> ${page}</p>` : ""}
          <div style="background:#fff;border-left:4px solid #7c3aed;padding:16px;border-radius:4px;margin-top:12px;white-space:pre-wrap">${message}</div>
        </div>
      `,
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Erreur envoi email" }, { status: 500 });
  }
}
