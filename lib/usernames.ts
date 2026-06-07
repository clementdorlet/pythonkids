/**
 * Validation des pseudos côté serveur.
 * Plateforme pour enfants : pseudos courts, charset restreint, blocklist d'insultes.
 */

const USERNAME_RE = /^[\p{L}\p{N} _.\-]{2,20}$/u;

// Liste non exhaustive — vise les cas les plus courants (fr/en), après normalisation leet.
const BLOCKLIST = [
  "merde", "putain", "pute", "salope", "connard", "connasse", "encule",
  "batard", "pd", "fdp", "ntm", "nique", "bite", "couille", "cul",
  "fuck", "shit", "bitch", "asshole", "dick", "cunt", "porn", "sex",
  "nazi", "hitler",
];

const LEET: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t",
  "@": "a", "$": "s", "!": "i",
};

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split("")
    .map((c) => LEET[c] ?? c)
    .filter((c) => /[a-z]/.test(c))
    .join("");
}

export function isValidUsername(name: unknown): name is string {
  if (typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed !== name || !USERNAME_RE.test(trimmed)) return false;
  const norm = normalize(trimmed);
  return !BLOCKLIST.some((bad) => norm.includes(bad));
}
