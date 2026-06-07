/**
 * Point d'entrée unique vers l'API serveur.
 *
 * Sur le web, API_BASE est vide → URLs relatives ("/api/...") comme avant.
 * Dans l'app native (Capacitor), définir NEXT_PUBLIC_API_BASE au build
 * (ex: https://pythonkids-production.up.railway.app) pour que les appels
 * sortent de la webview vers le serveur Railway.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

/** fetch() préfixé par API_BASE — à utiliser pour tous les appels /api/. */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, init);
}
