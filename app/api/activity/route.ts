import { readData, updateData } from "@/lib/serverStorage";
import { isValidUsername } from "@/lib/usernames";
import type { ActivityEvent } from "@/lib/apiTypes";

export type { ActivityEvent } from "@/lib/apiTypes";

const FILE = "activity.json";
const MAX_EVENTS = 500;
const MAX_DETAIL_LENGTH = 120;
const TYPES: ActivityEvent["type"][] = ["lesson", "badge", "challenge", "streak"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const friends = url.searchParams.get("friends")?.split(",").filter(Boolean) ?? [];
  if (friends.length === 0) return Response.json([]);
  const all = await readData<ActivityEvent[]>(FILE, []);
  const filtered = all
    .filter((e) => friends.includes(e.username))
    .slice(-100)
    .reverse();
  return Response.json(filtered);
}

export async function POST(request: Request) {
  const body = await request.json() as Partial<ActivityEvent>;
  if (
    !isValidUsername(body.username) ||
    !body.type || !TYPES.includes(body.type) ||
    !body.detail || typeof body.detail !== "string" || body.detail.length > MAX_DETAIL_LENGTH
  ) {
    return Response.json({ error: "Invalid" }, { status: 400 });
  }
  const { username, type, detail } = body;

  await updateData<ActivityEvent[]>(FILE, [], (data) => {
    data.push({ username, type, detail, timestamp: new Date().toISOString() });
    if (data.length > MAX_EVENTS) data.splice(0, data.length - MAX_EVENTS);
    return data;
  });

  return Response.json({ ok: true });
}
