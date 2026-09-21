(() => {
  let busy = false;

  async function wake() {
    if (busy) return;

    busy = true;

    try {
      await chrome.runtime
        .sendMessage({
          type:
            "RXV_PUBLISHER_WAKE",
          source:
            `content:${location.host}`,
        })
        .catch(() => {});
    } finally {
      busy = false;
    }
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.type !== "RXV_PIN_WAKE") return;
    wake();
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
