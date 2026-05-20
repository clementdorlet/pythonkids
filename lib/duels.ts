const KEY = "pythonkids_duel_wins";

export function getDuelWins(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(KEY) ?? "0");
}

export function addDuelWin(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, String(getDuelWins() + 1));
}
