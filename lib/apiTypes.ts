/** Types partagés entre les routes API et les pages client. */

export interface LeaderboardEntry {
  username: string;
  score: number;
  updatedAt: string;
  skinGradient?: string;
}

export interface ActivityEvent {
  username: string;
  type: "lesson" | "badge" | "challenge" | "streak";
  detail: string;
  timestamp: string;
}

export interface DuelPlayer {
  username: string;
  status: "waiting" | "coding" | "solved";
  solvedAt: string | null;
}

export interface DuelRoom {
  roomId: string;
  challengeId: string;
  players: DuelPlayer[];
  createdAt: string;
}
