import { readData, updateData } from "@/lib/serverStorage";
import { isValidUsername } from "@/lib/usernames";
import type { LeaderboardEntry } from "@/lib/apiTypes";

export type { LeaderboardEntry } from "@/lib/apiTypes";

const FILE = "leaderboard.json";
const MAX_SCORE = 10_000_000;

export async function GET() {
  const data = await readData<LeaderboardEntry[]>(FILE, []);
  const sorted = [...data].sort((a, b) => b.score - a.score).slice(0, 50);
  return Response.json(sorted);
}

export async function POST(request: Request) {
  const body = await request.json() as { username?: string; score?: number; skinGradient?: string };
  const { username, score, skinGradient } = body;

  if (
    !isValidUsername(username) ||
    typeof score !== "number" ||
    !Number.isFinite(score) ||
    score < 0 ||
    score > MAX_SCORE
  ) {
    return Response.json({ error: "Invalid data" }, { status: 400 });
  }

  await updateData<LeaderboardEntry[]>(FILE, [], (data) => {
    const idx = data.findIndex((e) => e.username === username);
    if (idx >= 0) {
      const updated: LeaderboardEntry = {
        ...data[idx],
        updatedAt: new Date().toISOString(),
        ...(skinGradient ? { skinGradient } : {}),
      };
      if (score > data[idx].score) updated.score = score;
      data[idx] = updated;
    } else {
      data.push({ username, score, updatedAt: new Date().toISOString(), ...(skinGradient ? { skinGradient } : {}) });
    }
    return data;
  });

  return Response.json({ ok: true });
}
