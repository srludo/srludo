/* RTS Ludo browser push service worker.
   This file must be hosted at the website origin root:
   https://www.rtsourludo.sbs/push-sw.js
*/
self.addEventListener("push", (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; }
  catch { payload = { title: "RTS Ludo", body: event.data ? event.data.text() : "You have a new notification." }; }

  const title = payload.title || "RTS Ludo";
  const options = {
    body: payload.body || "There is an update in your battle.",
    icon: payload.icon || "/logo.png",
    badge: payload.badge || "/logo.png",
    data: { url: payload.url || "/battles.html" },
    tag: payload.tag || "rts-ludo-update",
    renotify: false
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/battles.html", self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        await client.focus();
        if ("navigate" in client) await client.navigate(target);
        return;
      }
    }
    if (clients.openWindow) await clients.openWindow(target);
  })());
});
