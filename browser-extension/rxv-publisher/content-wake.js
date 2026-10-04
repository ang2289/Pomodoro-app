(() => {
  let busy = false;

  async function wake(sourceOverride = "") {
    if (busy) {
      return {
        ok: true,
        busy: true,
      };
    }

    busy = true;

    try {
      const result =
        await chrome.runtime
          .sendMessage({
            type:
              "RXV_PUBLISHER_WAKE",
            source:
              sourceOverride ||
              `content:${location.host}`,
          })
          .catch(
            (error) => ({
              ok: false,
              error:
                String(
                  error?.message ||
                  error,
                ),
            }),
          );

      if (
        location.port ===
        "3018"
      ) {
        window.postMessage(
          {
            type:
              "RXV_PIN_WAKE_RESULT",
            result:
              result || null,
          },
          location.origin,
        );
      }

      return result;
    } finally {
      busy = false;
    }
  }

  // Pinterest is only claimed from an explicit 3018 button click.
  // No page-load wake and no repeating heartbeat here.
  window.addEventListener(
    "message",
    (event) => {
      if (
        event.source !== window
      ) {
        return;
      }

      if (
        !event.data ||
        event.data.type !==
          "RXV_PIN_WAKE"
      ) {
        return;
      }

      wake(
        "pinterest-button",
      );
    },
  );
})();
