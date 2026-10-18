/* RTS Ludo push subscription helper.
   Load this on pages where users are logged in.
   Set PUSH_API_URL to your deployed Cloudflare Worker URL.
   Set VAPID_PUBLIC_KEY to the public VAPID key from the key pair used by your sender.
*/
(() => {
  const PUSH_API_URL = "https://rts-ludo-push.expertdigitalmarketingsamarth.workers.dev";
  const VAPID_PUBLIC_KEY = "REPLACE_WITH_MATCHING_VAPID_PUBLIC_KEY";

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
  }

  async function enablePush(playerId) {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      throw new Error("This browser does not support web push notifications.");
    }
    if (!playerId) throw new Error("Player identity is unavailable. Please sign in first.");
    if (VAPID_PUBLIC_KEY.startsWith("REPLACE_")) {
      throw new Error("VAPID public key has not been configured yet.");
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") throw new Error("Notification permission was not granted.");

    const registration = await navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    const response = await fetch(`${PUSH_API_URL}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, subscription: subscription.toJSON() })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Could not save push subscription.");
    return result;
  }

  // Browser policy usually blocks permission prompts on page load.
  // Offer a button and call this function from a real user click instead.
  window.RTSLudoPush = { enablePush };
})();
