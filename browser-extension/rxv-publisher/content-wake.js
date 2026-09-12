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
