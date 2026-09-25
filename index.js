export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const ORIGIN_BASE = "https://cablered.iptvperu.tv:1936/cablered/history/";

    if (url.pathname === "/") {
      return new Response("FENIX CACHE ONLINE", {
        headers: { "content-type": "text/plain" },
      });
    }

    // Todo lo demás lo proxeamos al origen
    // /history.m3u8  ->  ORIGIN_BASE + "playlist.m3u8"
    // /chunklist_x.m3u8 -> ORIGIN_BASE + "chunklist_x.m3u8"
    // /seg_1.ts -> ORIGIN_BASE + "seg_1.ts"

    let originPath;
    if (url.pathname === "/history.m3u8") {
      originPath = "playlist.m3u8";
    } else {
      originPath = url.pathname.replace(/^\//, ""); // quita la / inicial
    }

    const originUrl = ORIGIN_BASE + originPath;

    // ¿Está en caché?  (solo para .m3u8 y .ts pequeños; corto tiempo)
    const cache = caches.default;
    const cacheKey = new Request(originUrl, { method: "GET" });

    // Para el playlist principal NO cacheamos (es live y cambia cada pocos seg)
    // Para segmentos .ts sí podemos cachear unos segundos/minutos.
    let cacheable = originPath.endsWith(".ts");

    if (cacheable) {
      const hit = await cache.match(cacheKey);
      if (hit) return hit;
    }

    const originResp = await fetch(originUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        // Reenviamos cabeceras relevantes del cliente
        ...(request.headers.get("range")
          ? { Range: request.headers.get("range") }
          : {}),
      },
    });

    if (!originResp.ok) {
      return new Response("ERROR ORIGIN " + originResp.status, {
        status: 502,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const contentType =
      originResp.headers.get("content-type") ||
      (originPath.endsWith(".m3u8")
        ? "application/vnd.apple.mpegurl"
        : "video/mp2t");

    // Si es un m3u8, reescribimos las URLs internas para que apunten al Worker
    if (originPath.endsWith(".m3u8")) {
      let text = await originResp.text();

      const workerOrigin = url.origin; // p.ej. https://tu-worker.workers.dev

      // Reescribimos cada línea que NO sea comentario y no esté vacía
      text = text
        .split("\n")
        .map((line) => {
          const t = line.trim();
          if (!t || t.startsWith("#")) return line;

          // Si ya es absoluta, la dejamos
          if (/^https?:\/\//i.test(t)) return t;

          // Aplanamos la ruta al nivel del Worker (sin subcarpetas)
          const clean = t.replace(/^\.?\//, "").split("/").pop();
          return `${workerOrigin}/${clean}`;
        })
        .join("\n");

      return new Response(text, {
        headers: {
          "content-type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // Segmentos .ts → devolvemos binario y cacheamos un poco
    const resp = new Response(originResp.body, {
      status: originResp.status,
      headers: {
        "content-type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60",
      },
    });

    if (cacheable && resp.ok) {
      ctx.waitUntil(cache.put(cacheKey, resp.clone()));
    }

    return resp;
  },
};
