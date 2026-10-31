// API pública de solo lectura. No se necesitan credenciales.
export const ENDPOINT = 'https://openlibrary.org/search.json';
export function normalizeQuery(input) {
  const value = String(input ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
  if (value.length < 2 || value.length > 80) throw new Error('Escribe entre 2 y 80 caracteres.');
  if (!/^[\p{L}\p{M}\p{N} .,'’¡!¿?()\-]+$/u.test(value)) throw new Error('Usa letras, números y signos habituales de títulos.');
  return value;
}
export function buildUrl(query, mode) {
  const text = normalizeQuery(query);
  if (!['title', 'author'].includes(mode)) throw new Error('Selecciona título o autor.');
  return `${ENDPOINT}?${mode}=${encodeURIComponent(text)}&limit=12&fields=key,title,author_name,first_publish_year,edition_count`;
}
export function parseBooks(data) {
  if (!data || !Array.isArray(data.docs)) throw new Error('El servicio devolvió una respuesta no válida.');
  const books = data.docs.filter(x => x && typeof x.key === 'string' && /^\/works\/OL\d+W$/.test(x.key) && typeof x.title === 'string').map(x => ({
    id: x.key, title: x.title,
    authors: Array.isArray(x.author_name) ? x.author_name.filter(a => typeof a === 'string').join(', ') || 'Autor no disponible' : 'Autor no disponible',
    year: Number.isInteger(x.first_publish_year) ? String(x.first_publish_year) : 'No disponible',
    editions: Number.isInteger(x.edition_count) && x.edition_count >= 0 ? String(x.edition_count) : 'No disponible',
  }));
  const total = data.numFound ?? data.num_found;
  return { books: [...new Map(books.map(x => [x.id, x])).values()], total: Number.isInteger(total) && total >= 0 ? total : books.length };
}
export function createClient({ fetcher = globalThis.fetch, now = Date.now, timeoutMs = 15000 } = {}) {
  const cache = new Map();
  let lastStart = -Infinity, blockedUntil = 0, busy = false;
  return async function search(query, mode = 'title', refresh = false) {
    const url = buildUrl(query, mode);
    if (busy) throw new Error('Espera a que termine la consulta actual.');
    const current = now();
    if (current < blockedUntil) throw new Error(`Límite temporal. Espera ${Math.ceil((blockedUntil-current)/1000)} segundos.`);
    const saved = cache.get(url);
    if (!refresh && saved && current - saved.time < 300000) return { ...saved.data, cached: true };
    if (current - lastStart < 1200) throw new Error('Espera un momento antes de volver a consultar.');
    busy = true; lastStart = current;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetcher(url, { method: 'GET', headers: { Accept: 'application/json' }, signal: controller.signal });
      if (response.status === 429) {
        const raw = response.headers.get('Retry-After');
        const seconds = raw && /^\d+$/.test(raw) ? Number(raw) : NaN;
        const date = raw ? Date.parse(raw) : NaN;
        const wait = Number.isFinite(seconds) ? seconds * 1000 : Number.isFinite(date) ? date - now() : 60000;
        blockedUntil = now() + Math.max(1200, wait);
        throw new Error('El servicio alcanzó su límite de solicitudes. Espera antes de reintentar.');
      }
      if (!response.ok) throw new Error(`Servicio no disponible (HTTP ${response.status}). Intenta más tarde.`);
      let json;
      try { json = await response.json(); } catch { throw new Error('El servicio no devolvió JSON válido.'); }
      const data = parseBooks(json);
      if (cache.size >= 20) cache.delete(cache.keys().next().value);
      cache.set(url, { time: now(), data });
      return { ...data, cached: false };
    } catch (error) {
      if (error?.name === 'AbortError') throw new Error('La consulta tardó demasiado. Revisa tu conexión y reintenta.');
      if (error instanceof TypeError) throw new Error('No fue posible conectar. Revisa tu conexión a Internet.');
      throw error;
    } finally { clearTimeout(timer); busy = false; }
  };
}
