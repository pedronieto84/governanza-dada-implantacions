// ─── Configuració centralitzada del Backend API ───────────────────────────────
// Modifica BACKEND_PORT per apuntar al port on corre el backend NestJS.
// Ha de coincidir amb el PORT definit al fitxer .env de l'arrel del projecte.

export const BACKEND_PORT = 3005;
export const API_BASE = `http://localhost:${BACKEND_PORT}`;
