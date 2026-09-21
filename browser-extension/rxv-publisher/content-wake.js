(() => {
  let busy = false;

  async function wake(sourceOverride = "") {
    if (busy) return;

    busy = true;

    try {
      const result = await chrome.runtime
        .sendMessage({
          type:
            "RXV_PUBLISHER_WAKE",
          source:
            sourceOverride || `content:${location.host}`,
        })
        .catch((error) => ({
          ok: false,
          error: String(error?.message || error),
        }));

      if (location.port === "3018") {
        window.postMessage({
          type: "RXV_PIN_WAKE_RESULT",
          result: result || null,
        }, location.origin);
      }

      return result;
    } finally {
      busy = false;
    }
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.type !== "RXV_PIN_WAKE") return;
    wake("pinterest-button");
  });

  wake();

  const timer =
    window.setInterval(
      wake,
      1500,
    );

  window.addEventListener(
    "beforeunload",
    () =>
      window.clearInterval(
        timer,
      ),
    {
      once: true,
    },
  );
})();
