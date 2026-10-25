
const CACHE_NAME = "ordenando-actividades-v2";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARCHIVOS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then(nombres =>
      Promise.all(
        nombres
          .filter(nombre =>
            nombre.startsWith("ordenando-actividades-") &&
            nombre !== CACHE_NAME
          )
          .map(nombre => caches.delete(nombre))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;

  evento.respondWith(
    fetch(evento.request)
      .then(respuesta => {
        if (respuesta.ok) {
          const copia = respuesta.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(evento.request, copia)
          );
        }
        return respuesta;
      })
      .catch(async () => {
        const guardada = await caches.match(evento.request);
        if (guardada) return guardada;
        return new Response("Sin conexión a internet.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      })
  );
});
