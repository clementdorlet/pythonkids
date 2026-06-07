import { readData, updateData } from "@/lib/serverStorage";
import { isValidUsername } from "@/lib/usernames";

const FILE = "friends.json";

type FriendsData = Record<string, string[]>;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const username = url.searchParams.get("username");
  if (!username) return Response.json({ error: "username required" }, { status: 400 });
  const data = await readData<FriendsData>(FILE, {});
  return Response.json(data[username] ?? []);
}

export async function POST(request: Request) {
  const body = await request.json() as {
    action: "add" | "remove";
    username: string;
    friend: string;
  };
  const { action, username, friend } = body;

  if (!isValidUsername(username) || !isValidUsername(friend) || username === friend) {
    return Response.json({ error: "Invalid" }, { status: 400 });
  }
  if (action !== "add" && action !== "remove") {
    return Response.json({ error: "Action inconnue" }, { status: 400 });
  }

  await updateData<FriendsData>(FILE, {}, (data) => {
    data[username] = data[username] ?? [];
    data[friend] = data[friend] ?? [];
    if (action === "add") {
      if (!data[username].includes(friend)) data[username].push(friend);
      if (!data[friend].includes(username)) data[friend].push(username);
    } else {
      data[username] = data[username].filter((f) => f !== friend);
      data[friend] = data[friend].filter((f) => f !== username);
    }
    return data;
  });

  return Response.json({ ok: true });
}
