const RXV_BASE =
  "http://localhost:3006";
const VERSION = "39.21.0";
let busy = false;
let lastPing = 0;

async function runtimeState() {
  try {
    const value =
      await chrome.runtime.sendMessage({
        type:
          "RXV_PUBLISHER_STATE",
      });

    return value || {};
  } catch {
    return {};
  }
}

async function tick() {
  if (busy) return;

  busy = true;

  try {
    const state =
      await runtimeState();

    const activeJobId =
      String(
        state?.activeJobId || "",
      );

    const now = Date.now();

    // Keep a visible heartbeat even when there is no job.
    if (
      now - lastPing >
      5000
    ) {
      lastPing = now;

      await fetch(
        `${RXV_BASE}/publisher-extension/ping`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            version: VERSION,
            browser:
              "Microsoft Edge / normal profile",
            currentUrl: "",
            activeJobId,
          }),
        },
      ).catch(() => {});
    }

    // V39.4: background owns queue claiming + the complete async upload.
    // Waiting for this response keeps the service-worker message alive.
    await chrome.runtime
      .sendMessage({
        type:
          "RXV_PUBLISHER_WAKE",
        source:
          "offscreen",
      })
      .catch(() => {});
  } finally {
    busy = false;
  }
}

setInterval(
  tick,
  1200,
);

tick();
