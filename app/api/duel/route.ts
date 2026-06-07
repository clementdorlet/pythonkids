import { readData, updateData } from "@/lib/serverStorage";
import { isValidUsername } from "@/lib/usernames";
import type { DuelRoom } from "@/lib/apiTypes";

export type { DuelPlayer, DuelRoom } from "@/lib/apiTypes";

const FILE = "duels.json";

// Nettoyer les rooms de plus de 2h
function fresh(rooms: DuelRoom[]): DuelRoom[] {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  return rooms.filter((r) => new Date(r.createdAt).getTime() > cutoff);
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId");
  const rooms = fresh(await readData<DuelRoom[]>(FILE, []));
  if (!roomId) return Response.json(rooms);
  const room = rooms.find((r) => r.roomId === roomId);
  if (!room) return Response.json({ error: "Room introuvable" }, { status: 404 });
  return Response.json(room);
}

export async function POST(request: Request) {
  const body = await request.json() as {
    action: "create" | "join" | "solve";
    roomId?: string;
    username?: string;
    challengeId?: string;
  };

  if (!isValidUsername(body.username)) {
    return Response.json({ error: "Pseudo invalide" }, { status: 400 });
  }
  const username = body.username;

  if (body.action === "create") {
    if (!body.challengeId) return Response.json({ error: "Invalid" }, { status: 400 });
    const room: DuelRoom = {
      roomId: randomId(),
      challengeId: body.challengeId,
      players: [{ username, status: "coding", solvedAt: null }],
      createdAt: new Date().toISOString(),
    };
    await updateData<DuelRoom[]>(FILE, [], (rooms) => [...fresh(rooms), room]);
    return Response.json(room);
  }

  if (body.action === "join") {
    if (!body.roomId) return Response.json({ error: "Invalid" }, { status: 400 });
    let error: { message: string; status: number } | null = null;
    let joined: DuelRoom | null = null;
    await updateData<DuelRoom[]>(FILE, [], (all) => {
      const rooms = fresh(all);
      const room = rooms.find((r) => r.roomId === body.roomId);
      if (!room) { error = { message: "Room introuvable", status: 404 }; return rooms; }
      if (room.players.find((p) => p.username === username)) { joined = room; return rooms; }
      if (room.players.length >= 2) { error = { message: "Room pleine", status: 409 }; return rooms; }
      room.players.push({ username, status: "coding", solvedAt: null });
      joined = room;
      return rooms;
    });
    if (error) {
      const { message, status } = error;
      return Response.json({ error: message }, { status });
    }
    return Response.json(joined);
  }

  if (body.action === "solve") {
    if (!body.roomId) return Response.json({ error: "Invalid" }, { status: 400 });
    let solved: DuelRoom | null = null;
    await updateData<DuelRoom[]>(FILE, [], (all) => {
      const rooms = fresh(all);
      const room = rooms.find((r) => r.roomId === body.roomId);
      if (!room) return rooms;
      const player = room.players.find((p) => p.username === username);
      if (player && player.status !== "solved") {
        player.status = "solved";
        player.solvedAt = new Date().toISOString();
      }
      solved = room;
      return rooms;
    });
    if (!solved) return Response.json({ error: "Room introuvable" }, { status: 404 });
    return Response.json(solved);
  }

  return Response.json({ error: "Action inconnue" }, { status: 400 });
}
