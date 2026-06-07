import { updateData } from "@/lib/serverStorage";

const FILE = "push-subscriptions.json";

export async function POST(request: Request) {
  const sub = await request.json() as PushSubscriptionJSON;
  if (!sub?.endpoint) return Response.json({ error: "Subscription invalide" }, { status: 400 });

  await updateData<PushSubscriptionJSON[]>(FILE, [], (subs) => {
    const exists = subs.some((s) => s.endpoint === sub.endpoint);
    if (!exists) subs.push(sub);
    return subs;
  });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { endpoint } = await request.json() as { endpoint: string };
  await updateData<PushSubscriptionJSON[]>(FILE, [], (subs) =>
    subs.filter((s) => s.endpoint !== endpoint)
  );
  return Response.json({ ok: true });
}
