import { promises as fs } from "fs";
import path from "path";

/**
 * Stockage serveur centralisé (fichiers JSON).
 *
 * Les fichiers vivent dans DATA_DIR (variable d'environnement), par défaut ./data.
 * En production (Railway), monter un volume persistant et définir DATA_DIR sur son
 * point de montage (ex: /data) pour que les données survivent aux déploiements.
 *
 * - Écritures atomiques (fichier temporaire + rename) : jamais de JSON à moitié écrit.
 * - File d'attente par fichier : les read-modify-write concurrents sont sérialisés
 *   au sein de l'instance, ce qui élimine les pertes de mises à jour.
 */
export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(file: string, data: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = path.join(DATA_DIR, file);
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, target);
}

// Une promesse par fichier : chaque opération attend la précédente.
const queues = new Map<string, Promise<unknown>>();

function enqueue<R>(file: string, op: () => Promise<R>): Promise<R> {
  const prev = queues.get(file) ?? Promise.resolve();
  const next = prev.then(op, op);
  queues.set(file, next.then(() => undefined, () => undefined));
  return next;
}

/** Lit un fichier JSON de DATA_DIR. Retourne `fallback` s'il n'existe pas ou est corrompu. */
export function readData<T>(file: string, fallback: T): Promise<T> {
  return enqueue(file, () => readJsonFile(file, fallback));
}

/**
 * Read-modify-write sérialisé : `fn` reçoit les données actuelles et retourne
 * les nouvelles données, qui sont écrites de façon atomique.
 */
export function updateData<T>(file: string, fallback: T, fn: (data: T) => T | Promise<T>): Promise<T> {
  return enqueue(file, async () => {
    const data = await readJsonFile(file, fallback);
    const updated = await fn(data);
    await writeJsonFile(file, updated);
    return updated;
  });
}
