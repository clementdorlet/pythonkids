import { readData, updateData } from "@/lib/serverStorage";

const FILE = "online.json";
const TTL_MS = 2 * 60 * 1000; // 2 minutes

type OnlineStore = Record<string, string>; // sessionId → ISO timestamp

function countActive(data: OnlineStore): number {
  const cutoff = Date.now() - TTL_MS;
  return Object.values(data).filter((ts) => new Date(ts).getTime() > cutoff).length;
}

function purge(data: OnlineStore): OnlineStore {
  const cutoff = Date.now() - TTL_MS;
  return Object.fromEntries(
    Object.entries(data).filter(([, ts]) => new Date(ts).getTime() > cutoff)
  );
}

export async function GET() {
  const data = await readData<OnlineStore>(FILE, {});
  return Response.json({ count: countActive(data) });
}

export async function POST(request: Request) {
  const body = await request.json() as { sessionId?: string };
  if (!body.sessionId || typeof body.sessionId !== "string" || body.sessionId.length > 64) {
    return Response.json({ error: "Invalid" }, { status: 400 });
  }
  const sessionId = body.sessionId;

  const updated = await updateData<OnlineStore>(FILE, {}, (data) => {
    const purged = purge(data);
    purged[sessionId] = new Date().toISOString();
    return purged;
  });
  return Response.json({ count: countActive(updated) });
}
