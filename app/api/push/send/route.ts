import webpush from "web-push";
import { readData, updateData } from "@/lib/serverStorage";

const SUBS_FILE = "push-subscriptions.json";

export async function POST(request: Request) {
  const secret = request.headers.get("x-push-secret");
  if (secret !== process.env.PUSH_SEND_SECRET) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:contact@pythonkids.fr";

  if (!publicKey || !privateKey) {
    return Response.json({ error: "VAPID keys not configured" }, { status: 500 });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const subs = await readData<PushSubscriptionJSON[]>(SUBS_FILE, []);
  if (subs.length === 0) {
    return Response.json({ sent: 0, message: "Aucun abonné" });
  }

  const payload = JSON.stringify({
    title: "🐍 PythonKids — Ta leçon du jour !",
    body: "N'oublie pas ta leçon Python aujourd'hui pour garder ton streak 🔥",
    url: "/",
    icon: "/manifest.json",
  });

  let sent = 0;
  const failed: string[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub as Parameters<typeof webpush.sendNotification>[0], payload);
        sent++;
      } catch {
        failed.push(sub.endpoint ?? "");
      }
    })
  );

  if (failed.length > 0) {
    await updateData<PushSubscriptionJSON[]>(SUBS_FILE, [], (current) =>
      current.filter((s) => !failed.includes(s.endpoint ?? ""))
    );
  }

  return Response.json({ sent, failed: failed.length });
}
