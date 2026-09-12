const RXV_BASE = "http://localhost:3006";
const VERSION = "39.10.0";
let activeJob = null;
let lastWakeAt = 0;

async function setPublisherPhase(
  phase,
  extra = {},
) {
  const payload = {
    rxvPublisherPhase:
      String(phase || ""),
    rxvPublisherLastUpdate:
      Date.now(),
    ...extra,
  };

  await chrome.storage.local
    .set(payload)
    .catch(() => {});
}

async function getActiveTabUrl() {
  try {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    return String(
      tabs?.[0]?.url || "",
    ).split("?")[0];
  } catch {
    return "";
  }
}

async function pingPublisher() {
  const currentUrl =
    await getActiveTabUrl();

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
        currentUrl,
        activeJobId:
          activeJob?.id || "",
      }),
    },
  ).catch(() => {});
}

async function pollAndRunNextJob(
  source = "background",
) {
  lastWakeAt = Date.now();

  await pingPublisher();

  if (activeJob) {
    return {
      ok: true,
      busy: true,
      activeJobId:
        activeJob?.id || "",
      source,
    };
  }

  const res = await fetch(
    `${RXV_BASE}/publisher-extension/next`,
  ).catch(() => null);

  if (!res?.ok) {
    await setPublisherPhase(
      "QUEUE_FETCH_FAILED",
      {
        rxvPublisherLastError:
          "PUBLISHER_EXTENSION_NEXT_FAILED",
      },
    );

    return {
      ok: false,
      error:
        "PUBLISHER_EXTENSION_NEXT_FAILED",
    };
  }

  const data =
    await res.json().catch(() => ({}));

  if (!data?.job) {
    await setPublisherPhase(
      "IDLE",
      {
        rxvPublisherLastError: "",
      },
    );

    return {
      ok: true,
      idle: true,
      source,
    };
  }

  await setPublisherPhase(
    "JOB_RECEIVED",
    {
      rxvPublisherLastJobId:
        String(data.job.id || ""),
      rxvPublisherLastPlatform:
        String(
          data.job.platform || "",
        ),
      rxvPublisherLastError: "",
    },
  );

  // IMPORTANT:
  // Await the entire browser job here. In MV3, starting handleJob()
  // without awaiting it lets Edge suspend the service worker while the
  // upload task is still running.
  await handleJob(data.job);

  return {
    ok: true,
    handled: true,
    jobId:
      String(data.job.id || ""),
    source,
  };
}


async function ensureOffscreen() {
  if (!chrome.offscreen?.createDocument) return;
  const contexts = await chrome.runtime.getContexts?.({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [chrome.runtime.getURL("offscreen.html")],
  });
  if (Array.isArray(contexts) && contexts.length) return;
  try {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["DOM_PARSER"],
      justification: "Keep the local RxV publisher queue heartbeat active while Edge is open.",
    });
  } catch (_) {}
}

chrome.runtime.onInstalled.addListener(() => ensureOffscreen());
chrome.runtime.onStartup.addListener(() => ensureOffscreen());
ensureOffscreen();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exec(tabId, func, args = []) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func,
    args,
  });
  return result?.[0]?.result;
}

async function waitTabComplete(tabId, timeoutMs = 45000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (!tab) throw new Error("TAB_CLOSED");
    if (tab.status === "complete") return tab;
    await sleep(300);
  }
  return chrome.tabs.get(tabId);
}

function platformDomain(platform) {
  if (platform === "facebook") return "facebook.com";
  if (platform === "tiktok") return "tiktok.com";
  return "";
}

async function getOrCreatePlatformTab(job) {
  const domain = platformDomain(job.platform);
  const tabs = await chrome.tabs.query({});
  let tab = tabs.find((item) =>
    String(item.url || "").includes(domain),
  );

  if (!tab) {
    tab = await chrome.tabs.create({
      url: job.targetUrl,
      active: true,
    });
  } else {
    await chrome.tabs.update(tab.id, {
      url: job.targetUrl,
      active: true,
    });
  }

  await waitTabComplete(tab.id, 45000);
  await sleep(1200);
  return chrome.tabs.get(tab.id);
}

async function detectLoginRequired(tabId, platform) {
  return Boolean(await exec(tabId, (platform) => {
    const url = location.href.toLowerCase();
    const body = (document.body?.innerText || "").toLowerCase();
    if (platform === "facebook") {
      return (
        /\/login(?:\/|\?|$)/.test(url) ||
        body.includes("登入 facebook") ||
        body.includes("log into facebook")
      );
    }
    if (platform === "tiktok") {
      const hasUploadInput = Boolean(document.querySelector('input[type="file"]'));
      return (
        /\/login(?:\/|\?|$)/.test(url) ||
        (!hasUploadInput && (
          body.includes("登入 tiktok") ||
          body.includes("log in to tiktok") ||
          body.includes("使用 qr code")
        ))
      );
    }
    return false;
  }, [platform]));
}

async function setFileInput(tabId, filePath) {
  let attached = false;
  try {
    await chrome.debugger.attach({ tabId }, "1.3");
    attached = true;
    const doc = await chrome.debugger.sendCommand(
      { tabId },
      "DOM.getDocument",
      { depth: -1, pierce: true },
    );
    const result = await chrome.debugger.sendCommand(
      { tabId },
      "DOM.querySelectorAll",
      {
        nodeId: doc.root.nodeId,
        selector: 'input[type="file"]',
      },
    );
    const nodeId = Array.isArray(result?.nodeIds)
      ? result.nodeIds[0]
      : 0;
    if (!nodeId) throw new Error("FILE_INPUT_NOT_FOUND");
    await chrome.debugger.sendCommand(
      { tabId },
      "DOM.setFileInputFiles",
      { nodeId, files: [filePath] },
    );
    return true;
  } finally {
    if (attached) {
      await chrome.debugger.detach({ tabId }).catch(() => {});
    }
  }
}

async function clickVisibleText(tabId, texts, timeoutMs = 60000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const clicked = await exec(tabId, (texts) => {
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
      };
      const nodes = Array.from(document.querySelectorAll('button,[role="button"]'));
      for (const el of nodes) {
        if (!visible(el)) continue;
        const text = String(el.innerText || el.textContent || "").trim();
        if (!texts.includes(text)) continue;
        if (el.disabled || el.getAttribute("aria-disabled") === "true") continue;
        el.click();
        return text;
      }
      return "";
    }, [texts]);
    if (clicked) return clicked;
    await sleep(450);
  }
  return "";
}

async function fillCaption(tabId, text) {
  return Boolean(await exec(tabId, (text) => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
    };
    const selectors = [
      '[aria-label*="介紹你的 Reel"]',
      '[aria-label*="介紹你的Reel"]',
      '[placeholder*="介紹你的 Reel"]',
      '[placeholder*="說明"]',
      '[contenteditable="true"][role="textbox"]',
      'div[data-lexical-editor="true"][contenteditable="true"]',
      '[contenteditable="true"]',
      'textarea',
    ];
    for (const selector of selectors) {
      const list = Array.from(document.querySelectorAll(selector));
      for (const el of list) {
        if (!visible(el)) continue;
        el.focus();
        if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
          const proto = Object.getPrototypeOf(el);
          const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
          descriptor?.set?.call(el, text);
        } else {
          el.textContent = "";
          try {
            document.execCommand("insertText", false, text);
          } catch (_) {
            el.textContent = text;
          }
        }
        el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
    }
    return false;
  }, [text]));
}



async function getTikTokStaleDraftState(tabId) {
  return await exec(tabId, () => {
    const body =
      String(
        document.body?.innerText || "",
      );

    const hasPrompt =
      /有一段編輯中的影片尚未儲存|尚未儲存.*繼續編輯|unfinished.*video|continue editing|unsaved.*video/i.test(
        body,
      );

    const buttons =
      Array.from(
        document.querySelectorAll(
          'button,[role="button"]',
        ),
      )
        .map((el) => {
          const r =
            el.getBoundingClientRect();
          const s =
            getComputedStyle(el);

          const visible =
            r.width > 0 &&
            r.height > 0 &&
            s.display !== "none" &&
            s.visibility !== "hidden";

          return {
            text:
              String(
                el.innerText ||
                el.textContent ||
                "",
              ).trim(),
            visible,
          };
        })
        .filter(
          (item) => item.visible,
        );

    return {
      hasPrompt,
      buttons,
    };
  });
}

async function resolveTikTokStaleDraft(
  tabId,
  timeoutMs = 20000,
) {
  const started = Date.now();

  while (
    Date.now() - started <
    timeoutMs
  ) {
    const state =
      await getTikTokStaleDraftState(
        tabId,
      );

    if (!state?.hasPrompt) {
      return {
        ok: true,
        handled: false,
      };
    }

    const clicked =
      await exec(tabId, () => {
        const visible = (el) => {
          const r =
            el.getBoundingClientRect();
          const s =
            getComputedStyle(el);

          return (
            r.width > 0 &&
            r.height > 0 &&
            s.display !== "none" &&
            s.visibility !== "hidden"
          );
        };

        const discardLabels =
          new Set([
            "捨棄",
            "舍棄",
            "Discard",
            "Discard draft",
          ]);

        const nodes =
          Array.from(
            document.querySelectorAll(
              'button,[role="button"]',
            ),
          );

        for (const el of nodes) {
          if (!visible(el)) continue;

          const text =
            String(
              el.innerText ||
              el.textContent ||
              "",
            ).trim();

          if (
            !discardLabels.has(text)
          ) {
            continue;
          }

          if (
            el.disabled ||
            el.getAttribute(
              "aria-disabled",
            ) === "true"
          ) {
            continue;
          }

          el.scrollIntoView({
            block: "center",
          });

          el.click();

          return {
            ok: true,
            text,
          };
        }

        return {
          ok: false,
        };
      });

    if (!clicked?.ok) {
      await sleep(500);
      continue;
    }

    // TikTok replaces part of the Studio DOM after discarding the stale draft.
    await sleep(1200);

    const after =
      await getTikTokStaleDraftState(
        tabId,
      );

    if (!after?.hasPrompt) {
      return {
        ok: true,
        handled: true,
        clicked:
          clicked.text || "捨棄",
      };
    }
  }

  return {
    ok: false,
    handled: false,
    reason:
      "TIKTOK_STALE_DRAFT_BLOCKED",
  };
}

async function inspectTikTokFileInputs(tabId) {
  return await exec(tabId, () => {
    const inputs = Array.from(
      document.querySelectorAll('input[type="file"]'),
    );

    const details = inputs.map((el, index) => {
      const accept = String(
        el.getAttribute("accept") || "",
      ).toLowerCase();
      const nearby = String(
        el.parentElement?.parentElement?.innerText ||
        el.parentElement?.innerText ||
        "",
      ).slice(0, 240).toLowerCase();

      let score = 0;

      if (
        accept.includes("video") ||
        accept.includes(".mp4") ||
        accept.includes("mp4")
      ) {
        score += 1000;
      }

      if (!accept) {
        // TikTok sometimes uses a generic file input for the selected Video tab.
        score += 120;
      }

      if (
        accept.includes("image") &&
        !accept.includes("video")
      ) {
        score -= 1000;
      }

      if (
        nearby.includes("影片") ||
        nearby.includes("video")
      ) {
        score += 180;
      }

      if (
        (nearby.includes("照片") ||
          nearby.includes("photo") ||
          nearby.includes("image")) &&
        !nearby.includes("影片") &&
        !nearby.includes("video")
      ) {
        score -= 220;
      }

      return {
        index,
        accept,
        score,
        files: Number(el.files?.length || 0),
        multiple: Boolean(el.multiple),
      };
    });

    details.sort((a, b) => b.score - a.score);

    return {
      count: inputs.length,
      best: details[0] || null,
      details,
    };
  });
}

async function markTikTokVideoInputCandidate(tabId) {
  return await exec(tabId, () => {
    const marker = "data-rxv-publisher-video-input";
    const inputs = Array.from(
      document.querySelectorAll('input[type="file"]'),
    );

    for (const el of inputs) {
      el.removeAttribute(marker);
    }

    const ranked = inputs.map((el, index) => {
      const accept = String(
        el.getAttribute("accept") || "",
      ).toLowerCase();
      const nearby = String(
        el.parentElement?.parentElement?.innerText ||
        el.parentElement?.innerText ||
        "",
      ).slice(0, 240).toLowerCase();

      let score = 0;

      if (
        accept.includes("video") ||
        accept.includes(".mp4") ||
        accept.includes("mp4")
      ) {
        score += 1000;
      }

      if (!accept) score += 120;

      if (
        accept.includes("image") &&
        !accept.includes("video")
      ) {
        score -= 1000;
      }

      if (
        nearby.includes("影片") ||
        nearby.includes("video")
      ) {
        score += 180;
      }

      if (
        (nearby.includes("照片") ||
          nearby.includes("photo") ||
          nearby.includes("image")) &&
        !nearby.includes("影片") &&
        !nearby.includes("video")
      ) {
        score -= 220;
      }

      return { el, index, accept, score };
    }).sort((a, b) => b.score - a.score);

    const best = ranked[0];

    if (!best || best.score <= -500) {
      return {
        ok: false,
        count: inputs.length,
        details: ranked.map((item) => ({
          index: item.index,
          accept: item.accept,
          score: item.score,
        })),
      };
    }

    best.el.setAttribute(marker, "1");

    return {
      ok: true,
      index: best.index,
      accept: best.accept,
      score: best.score,
      count: inputs.length,
      details: ranked.map((item) => ({
        index: item.index,
        accept: item.accept,
        score: item.score,
      })),
    };
  });
}

async function waitForTikTokFileInput(
  tabId,
  timeoutMs = 30000,
) {
  const started = Date.now();
  let lastState = null;

  while (
    Date.now() - started <
    timeoutMs
  ) {
    lastState =
      await inspectTikTokFileInputs(
        tabId,
      );

    if (
      Number(lastState?.count || 0) > 0 &&
      Number(lastState?.best?.score ?? -999) > -500
    ) {
      return lastState;
    }

    await sleep(500);
  }

  return lastState;
}

async function setTikTokVideoFileInput(
  tabId,
  filePath,
  helperJobId,
) {
  const chosen =
    await markTikTokVideoInputCandidate(
      tabId,
    );

  if (!chosen?.ok) {
    throw new Error(
      `TIKTOK_VIDEO_FILE_INPUT_NOT_FOUND:${JSON.stringify(chosen || {})}`,
    );
  }

  const fileName =
    String(filePath || "")
      .split(/[\\/]/)
      .pop() ||
    "rxv-video.mp4";

  const videoUrl =
    `${RXV_BASE}/publisher-extension/video-file/${encodeURIComponent(String(helperJobId || ""))}?v=${Date.now()}`;

  // V39.10: do NOT use DOM.setFileInputFiles for TikTok Studio.
  // The current Studio build accepts the file briefly but then its own
  // AmazingEngine/VECodec pipeline can crash (preview flashes, then the
  // generic error page). Instead, fetch the local MP4 from the RxV backend,
  // construct a real File object inside the TikTok tab, assign it through a
  // DataTransfer FileList, and emit exactly ONE change event.
  const injected = await exec(
    tabId,
    async (videoUrl, fileName) => {
      const input =
        document.querySelector(
          'input[data-rxv-publisher-video-input="1"]',
        );

      if (!input) {
        return {
          ok: false,
          reason:
            "TIKTOK_MARKED_VIDEO_INPUT_NOT_FOUND",
        };
      }

      try {
        const response = await fetch(
          videoUrl,
          {
            method: "GET",
            cache: "no-store",
            credentials: "omit",
          },
        );

        if (!response.ok) {
          return {
            ok: false,
            reason:
              `TIKTOK_LOCAL_VIDEO_FETCH_HTTP_${response.status}`,
          };
        }

        const blob =
          await response.blob();

        if (!blob || !blob.size) {
          return {
            ok: false,
            reason:
              "TIKTOK_LOCAL_VIDEO_FETCH_EMPTY",
          };
        }

        const file = new File(
          [blob],
          fileName || "rxv-video.mp4",
          {
            type:
              blob.type ||
              "video/mp4",
            lastModified:
              Date.now(),
          },
        );

        const transfer =
          new DataTransfer();
        transfer.items.add(file);

        input.files =
          transfer.files;

        const assigned =
          Number(
            input.files?.length || 0,
          ) > 0;

        if (!assigned) {
          return {
            ok: false,
            reason:
              "TIKTOK_DATATRANSFER_ASSIGN_FAILED",
          };
        }

        input.setAttribute(
          "data-rxv-publisher-file-mode",
          "local-blob",
        );

        // Native file selection fires input/change, but firing both manually
        // caused instability on this TikTok build. TikTok listens to change;
        // send exactly one change event and leave the rest to Studio.
        input.dispatchEvent(
          new Event(
            "change",
            {
              bubbles: true,
              composed: true,
            },
          ),
        );

        return {
          ok: true,
          fileName:
            String(
              input.files?.[0]?.name ||
              "",
            ),
          fileSize:
            Number(
              input.files?.[0]?.size ||
              0,
            ),
          fileType:
            String(
              input.files?.[0]?.type ||
              "",
            ),
          blobSize:
            Number(blob.size || 0),
          mode: "local-blob",
        };
      } catch (error) {
        return {
          ok: false,
          reason:
            String(
              error?.message ||
              error ||
              "TIKTOK_LOCAL_BLOB_INJECT_FAILED",
            ),
        };
      }
    },
    [videoUrl, fileName],
  );

  if (!injected?.ok) {
    throw new Error(
      `TIKTOK_LOCAL_BLOB_INJECT_FAILED:${JSON.stringify({ chosen, injected })}`,
    );
  }

  await sleep(1600);

  const verification =
    await exec(tabId, () => {
      const input =
        document.querySelector(
          'input[data-rxv-publisher-video-input="1"]',
        );

      const body =
        String(
          document.body?.innerText ||
          "",
        );

      const lower =
        body.toLowerCase();

      const visible = (el) => {
        const r =
          el.getBoundingClientRect();
        const s =
          getComputedStyle(el);
        return (
          r.width > 0 &&
          r.height > 0 &&
          s.display !== "none" &&
          s.visibility !== "hidden"
        );
      };

      const hasEditor =
        Array.from(
          document.querySelectorAll(
            'textarea,[contenteditable="true"],[role="textbox"],.ProseMirror,[data-lexical-editor="true"]',
          ),
        )
          .filter(visible)
          .some((el) => {
            const aria =
              String(
                el.getAttribute("aria-label") ||
                "",
              ).toLowerCase();
            const placeholder =
              String(
                el.getAttribute("placeholder") ||
                "",
              ).toLowerCase();
            const nearby =
              String(
                el.parentElement?.parentElement?.innerText ||
                el.parentElement?.innerText ||
                "",
              )
                .slice(0, 300)
                .toLowerCase();
            const combined =
              `${aria} ${placeholder} ${nearby}`;
            return (
              combined.includes("說明") ||
              combined.includes("description") ||
              combined.includes("caption")
            );
          });

      const initialPrompt =
        /選擇要上傳的影片|選取影片|select video|choose a video|drag.*drop/i.test(
          body,
        );

      const fatalStudioError =
        (/出錯了|something went wrong/i.test(body) &&
          /請再試一次|try again|retry/i.test(body)) ||
        /頁面發生錯誤|page error/i.test(lower);

      const file =
        input?.files?.[0] || null;

      return {
        found: Boolean(input),
        files: Number(
          input?.files?.length ||
          0,
        ),
        name: String(
          file?.name || "",
        ),
        size: Number(
          file?.size || 0,
        ),
        type: String(
          file?.type || "",
        ),
        fileMode:
          String(
            input?.getAttribute(
              "data-rxv-publisher-file-mode",
            ) || "",
          ),
        hasEditor,
        initialPrompt,
        fatalStudioError,
      };
    });

  if (
    verification?.found &&
    Number(
      verification?.files || 0,
    ) < 1
  ) {
    throw new Error(
      `TIKTOK_VIDEO_FILE_ASSIGN_NOT_CONFIRMED:${JSON.stringify({ chosen, injected, verification })}`,
    );
  }

  return {
    chosen,
    injected,
    verification,
    eventMode:
      "local-blob-datatransfer-change-once",
  };
}

async function getTikTokDescriptionState(tabId) {
  return await exec(tabId, () => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return (
        r.width > 0 &&
        r.height > 0 &&
        s.display !== "none" &&
        s.visibility !== "hidden"
      );
    };

    const candidates = Array.from(
      document.querySelectorAll(
        'textarea,[contenteditable="true"],[role="textbox"],.ProseMirror,[data-lexical-editor="true"]',
      ),
    ).filter(visible);

    let best = null;
    let bestScore = -999;

    for (const el of candidates) {
      const aria =
        String(el.getAttribute("aria-label") || "");
      const placeholder =
        String(el.getAttribute("placeholder") || "");
      const nearby =
        String(
          el.parentElement?.parentElement?.innerText ||
          el.parentElement?.innerText ||
          "",
        ).slice(0, 350);

      const combined =
        `${aria} ${placeholder} ${nearby}`.toLowerCase();

      let score = 0;

      if (
        combined.includes("說明") ||
        combined.includes("description") ||
        combined.includes("caption")
      ) {
        score += 120;
      }

      if (
        el.getAttribute("contenteditable") === "true"
      ) {
        score += 25;
      }

      if (
        el.getAttribute("role") === "textbox"
      ) {
        score += 20;
      }

      const rect =
        el.getBoundingClientRect();

      if (rect.width > 300) score += 20;
      if (rect.height > 35) score += 10;
      if (rect.left < innerWidth * 0.8) score += 5;

      if (
        combined.includes("搜尋") ||
        combined.includes("search") ||
        combined.includes("評論") ||
        combined.includes("comment")
      ) {
        score -= 150;
      }

      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    }

    if (!best) {
      return {
        found: false,
        text: "",
        score: -1,
      };
    }

    const text =
      best instanceof HTMLTextAreaElement ||
      best instanceof HTMLInputElement
        ? String(best.value || "")
        : String(
            best.innerText ||
            best.textContent ||
            "",
          );

    return {
      found: true,
      text,
      score: bestScore,
      tagName: best.tagName,
      aria:
        String(
          best.getAttribute("aria-label") || "",
        ),
      placeholder:
        String(
          best.getAttribute("placeholder") || "",
        ),
    };
  });
}

async function focusAndClearTikTokDescription(tabId) {
  return Boolean(
    await exec(tabId, () => {
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return (
          r.width > 0 &&
          r.height > 0 &&
          s.display !== "none" &&
          s.visibility !== "hidden"
        );
      };

      const candidates = Array.from(
        document.querySelectorAll(
          'textarea,[contenteditable="true"],[role="textbox"],.ProseMirror,[data-lexical-editor="true"]',
        ),
      ).filter(visible);

      let best = null;
      let bestScore = -999;

      for (const el of candidates) {
        const aria =
          String(el.getAttribute("aria-label") || "");
        const placeholder =
          String(el.getAttribute("placeholder") || "");
        const nearby =
          String(
            el.parentElement?.parentElement?.innerText ||
            el.parentElement?.innerText ||
            "",
          ).slice(0, 350);

        const combined =
          `${aria} ${placeholder} ${nearby}`.toLowerCase();

        let score = 0;

        if (
          combined.includes("說明") ||
          combined.includes("description") ||
          combined.includes("caption")
        ) {
          score += 120;
        }

        if (
          el.getAttribute("contenteditable") === "true"
        ) {
          score += 25;
        }

        if (
          el.getAttribute("role") === "textbox"
        ) {
          score += 20;
        }

        const rect =
          el.getBoundingClientRect();

        if (rect.width > 300) score += 20;
        if (rect.height > 35) score += 10;
        if (rect.left < innerWidth * 0.8) score += 5;

        if (
          combined.includes("搜尋") ||
          combined.includes("search") ||
          combined.includes("評論") ||
          combined.includes("comment")
        ) {
          score -= 150;
        }

        if (score > bestScore) {
          bestScore = score;
          best = el;
        }
      }

      if (!best) return false;

      best.scrollIntoView({
        block: "center",
      });
      best.focus();

      if (
        best instanceof HTMLTextAreaElement ||
        best instanceof HTMLInputElement
      ) {
        const proto =
          Object.getPrototypeOf(best);
        const descriptor =
          Object.getOwnPropertyDescriptor(
            proto,
            "value",
          );

        descriptor?.set?.call(
          best,
          "",
        );

        best.dispatchEvent(
          new InputEvent("input", {
            bubbles: true,
            inputType:
              "deleteContentBackward",
          }),
        );
      } else {
        const selection =
          window.getSelection();

        if (selection) {
          const range =
            document.createRange();
          range.selectNodeContents(best);
          selection.removeAllRanges();
          selection.addRange(range);
        }

        try {
          document.execCommand(
            "delete",
            false,
          );
        } catch {}

        if (
          String(
            best.innerText ||
            best.textContent ||
            "",
          ).trim()
        ) {
          best.textContent = "";
        }

        best.dispatchEvent(
          new InputEvent("input", {
            bubbles: true,
            inputType:
              "deleteContentBackward",
          }),
        );
      }

      best.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      );

      return true;
    }),
  );
}

async function insertTikTokDescriptionNative(
  tabId,
  text,
) {
  const focused =
    await focusAndClearTikTokDescription(
      tabId,
    );

  if (!focused) {
    throw new Error(
      "TIKTOK_DESCRIPTION_EDITOR_NOT_FOUND",
    );
  }

  let attached = false;

  try {
    await chrome.debugger.attach(
      { tabId },
      "1.3",
    );
    attached = true;

    await chrome.debugger.sendCommand(
      { tabId },
      "Input.insertText",
      {
        text: String(text || ""),
      },
    );
  } finally {
    if (attached) {
      await chrome.debugger
        .detach({ tabId })
        .catch(() => {});
    }
  }

  await sleep(700);

  await exec(tabId, () => {
    const active =
      document.activeElement;

    if (!active) return;

    active.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
      }),
    );

    active.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );
  });

  return true;
}

async function verifyTikTokDescription(
  tabId,
  publishText,
  affiliateUrl,
) {
  const state =
    await getTikTokDescriptionState(
      tabId,
    );

  if (!state?.found) {
    return {
      ok: false,
      reason:
        "TIKTOK_DESCRIPTION_EDITOR_NOT_FOUND",
      state,
    };
  }

  const actual =
    String(state.text || "").trim();

  const expected =
    String(publishText || "").trim();

  const link =
    String(affiliateUrl || "").trim();

  const hashtags =
    expected.match(/#[^\s#]+/g) ||
    [];

  const hasLink =
    !link ||
    actual.includes(link);

  const hasKeywords =
    hashtags.length === 0 ||
    hashtags
      .slice(0, 3)
      .every((tag) =>
        actual.includes(tag),
      );

  const enoughText =
    actual.length >=
    Math.min(
      40,
      Math.max(
        10,
        Math.floor(
          expected.length * 0.25,
        ),
      ),
    );

  return {
    ok:
      hasLink &&
      hasKeywords &&
      enoughText,
    hasLink,
    hasKeywords,
    enoughText,
    actualLength:
      actual.length,
    expectedLength:
      expected.length,
    state,
  };
}

async function waitTikTokUploadReady(
  tabId,
  timeoutMs = 90000,
) {
  const started = Date.now();
  let lastState = null;

  while (
    Date.now() - started <
    timeoutMs
  ) {
    lastState =
      await exec(tabId, () => {
        const body =
          String(
            document.body?.innerText ||
            "",
          );
        const lower = body.toLowerCase();

        const visible = (el) => {
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return (
            r.width > 0 &&
            r.height > 0 &&
            s.display !== "none" &&
            s.visibility !== "hidden"
          );
        };

        const fileInputs = Array.from(
          document.querySelectorAll('input[type="file"]'),
        );
        const fileAssigned = fileInputs.some(
          (el) => Number(el.files?.length || 0) > 0,
        );

        const editors = Array.from(
          document.querySelectorAll(
            'textarea,[contenteditable="true"],[role="textbox"],.ProseMirror,[data-lexical-editor="true"]',
          ),
        ).filter(visible);

        const hasDescriptionEditor =
          editors.some((el) => {
            const aria = String(
              el.getAttribute("aria-label") || "",
            ).toLowerCase();
            const placeholder = String(
              el.getAttribute("placeholder") || "",
            ).toLowerCase();
            const nearby = String(
              el.parentElement?.parentElement?.innerText ||
              el.parentElement?.innerText ||
              "",
            ).slice(0, 300).toLowerCase();
            const combined = `${aria} ${placeholder} ${nearby}`;
            return (
              combined.includes("說明") ||
              combined.includes("description") ||
              combined.includes("caption")
            );
          });

        const publishButtonReady =
          Array.from(
            document.querySelectorAll('button,[role="button"]'),
          ).some((el) => {
            if (!visible(el)) return false;
            const text = String(
              el.innerText ||
              el.textContent ||
              "",
            ).trim();
            if (![
              "發佈",
              "發布",
              "Post",
              "Publish",
            ].includes(text)) {
              return false;
            }
            return (
              !el.disabled &&
              el.getAttribute("aria-disabled") !== "true"
            );
          });

        const initialUploadPrompt =
          /選擇要上傳的影片|選取影片|select video|choose a video|drag.*drop/i.test(
            body,
          );

        const uploadError =
          /上傳失敗|upload failed|failed to upload|couldn.?t upload/i.test(
            lower,
          );

        const fatalStudioError =
          (/出錯了|something went wrong/i.test(body) &&
            /請再試一次|try again|retry/i.test(body)) ||
          /頁面發生錯誤|page error/i.test(lower);

        const uploadedText =
          /已上傳|uploaded/i.test(body);

        const hasEditorSignals =
          hasDescriptionEditor ||
          /說明|description|封面|cover|可見度|visibility/i.test(
            body,
          );

        return {
          fileAssigned,
          hasDescriptionEditor,
          publishButtonReady,
          initialUploadPrompt,
          uploadError,
          fatalStudioError,
          uploadedText,
          hasEditorSignals,
          url: String(location.href || "").split("?")[0],
        };
      });

    if (lastState?.uploadError) {
      throw new Error(
        `TIKTOK_UPLOAD_FAILED_VISIBLE:${JSON.stringify(lastState)}`,
      );
    }

    if (lastState?.fatalStudioError) {
      return lastState;
    }

    if (
      lastState?.hasDescriptionEditor ||
      lastState?.publishButtonReady ||
      (
        lastState?.hasEditorSignals &&
        !lastState?.initialUploadPrompt
      ) ||
      (
        lastState?.uploadedText &&
        lastState?.hasEditorSignals
      )
    ) {
      return lastState;
    }

    await sleep(700);
  }

  return null;
}

async function clickTikTokPublish(
  tabId,
  timeoutMs = 60000,
) {
  const started = Date.now();

  while (
    Date.now() - started <
    timeoutMs
  ) {
    const clicked =
      await exec(tabId, () => {
        const visible = (el) => {
          const r =
            el.getBoundingClientRect();
          const s =
            getComputedStyle(el);

          return (
            r.width > 0 &&
            r.height > 0 &&
            s.display !== "none" &&
            s.visibility !== "hidden"
          );
        };

        const wanted =
          new Set([
            "發佈",
            "發布",
            "Post",
            "Publish",
          ]);

        const nodes =
          Array.from(
            document.querySelectorAll(
              'button,[role="button"]',
            ),
          );

        for (const el of nodes) {
          if (!visible(el)) continue;

          const text =
            String(
              el.innerText ||
              el.textContent ||
              "",
            ).trim();

          if (!wanted.has(text)) {
            continue;
          }

          if (
            el.disabled ||
            el.getAttribute(
              "aria-disabled",
            ) === "true"
          ) {
            continue;
          }

          el.scrollIntoView({
            block: "center",
          });

          el.click();

          return {
            ok: true,
            text,
          };
        }

        return {
          ok: false,
        };
      });

    if (clicked?.ok) {
      return clicked;
    }

    await sleep(500);
  }

  return {
    ok: false,
  };
}

async function waitTikTokPublished(
  tabId,
  timeoutMs = 90000,
) {
  const started = Date.now();

  while (
    Date.now() - started <
    timeoutMs
  ) {
    const state =
      await exec(tabId, () => {
        const url =
          String(location.href || "");

        const body =
          String(
            document.body?.innerText ||
            "",
          );

        const successText =
          [
            "發佈成功",
            "發布成功",
            "影片已發佈",
            "影片已發布",
            "已發佈",
            "已發布",
            "posted successfully",
            "published successfully",
            "your video has been published",
            "your video is being uploaded",
          ].some((marker) =>
            body
              .toLowerCase()
              .includes(
                marker.toLowerCase(),
              ),
          );

        const leftUploadPage =
          !/\/tiktokstudio\/upload/i.test(
            url,
          ) &&
          !/\/upload/i.test(url);

        return {
          successText,
          leftUploadPage,
          url:
            url.split("?")[0],
        };
      });

    if (
      state?.successText ||
      state?.leftUploadPage
    ) {
      return {
        ok: true,
        publishedUrl:
          String(
            state.url || "",
          ),
      };
    }

    await sleep(700);
  }

  return {
    ok: false,
    publishedUrl: "",
  };
}

async function ensureFacebookAiLabel(tabId) {
  return await exec(tabId, () => {
    const body = document.body;
    if (!body) return { found: false, on: false };
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_ELEMENT);
    let label = null;
    while (walker.nextNode()) {
      const el = walker.currentNode;
      const text = String(el.innerText || "").trim();
      if (text === "新增 AI 標籤" || text === "Add AI label" || text === "新增 AI 标签") {
        label = el;
        break;
      }
    }
    if (!label) return { found: false, on: false };
    const container = label.closest('div')?.parentElement || label.parentElement || document.body;
    const candidates = Array.from(container.querySelectorAll('[role="switch"],input[type="checkbox"]'));
    const toggle = candidates.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (!toggle) return { found: true, on: false };
    const isOn = toggle.matches('input')
      ? Boolean(toggle.checked)
      : toggle.getAttribute('aria-checked') === 'true';
    if (!isOn) toggle.click();
    const nowOn = toggle.matches('input')
      ? Boolean(toggle.checked)
      : toggle.getAttribute('aria-checked') === 'true';
    return { found: true, on: nowOn };
  });
}

async function waitForFinalButton(tabId, platform, timeoutMs = 60000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const ready = await exec(tabId, (platform) => {
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
      };
      const wanted = platform === "facebook"
        ? ["發佈", "發布", "Publish", "Share reel", "分享 Reel"]
        : ["發佈", "發布", "Post", "Publish"];
      return Array.from(document.querySelectorAll('button,[role="button"]')).some((el) => {
        if (!visible(el)) return false;
        const text = String(el.innerText || el.textContent || "").trim();
        return wanted.includes(text) && !el.disabled && el.getAttribute('aria-disabled') !== 'true';
      });
    }, [platform]);
    if (ready) return true;
    await sleep(500);
  }
  return false;
}

async function prepareFacebook(job, tabId) {
  await setFileInput(tabId, job.videoPath);
  const first = await clickVisibleText(tabId, ["繼續", "Continue", "下一步", "Next"], 90000);
  if (!first) throw new Error("FACEBOOK_CONTINUE_NOT_READY");
  await sleep(800);
  for (let i = 0; i < 3; i++) {
    const captionReady = await fillCaption(tabId, job.publishText);
    if (captionReady) break;
    const advanced = await clickVisibleText(tabId, ["繼續", "Continue", "下一步", "Next"], 12000);
    if (!advanced) break;
    await sleep(700);
  }
  const captionFilled = await fillCaption(tabId, job.publishText);
  if (!captionFilled) throw new Error("FACEBOOK_CAPTION_NOT_FILLED");
  const ai = job.aiDisclosureRequested
    ? await ensureFacebookAiLabel(tabId)
    : { found: false, on: false };
  const finalReady = await waitForFinalButton(tabId, "facebook", 30000);
  if (!finalReady) throw new Error("FACEBOOK_FINAL_BUTTON_NOT_READY");
  return {
    prepared: true,
    warning: job.aiDisclosureRequested && !ai.on ? "AI_LABEL_REVIEW_REQUIRED" : "",
    aiLabelFound: Boolean(ai.found),
    aiLabelOn: Boolean(ai.on),
  };
}

async function prepareTikTok(job, tabId) {
  const affiliateUrl =
    String(
      job.affiliateUrl || "",
    ).trim();

  let publishText =
    String(
      job.publishText || "",
    ).trim();

  const hashtagCandidates = [
    ...(publishText.match(/#[^\s#]+/g) || []),
    ...(String(job.hashtags || "").match(/#[^\s#]+/g) || []),
  ];

  const seenHashtags = new Set();
  const hashtags = [];
  for (const raw of hashtagCandidates) {
    const tag = String(raw || "").trim();
    if (!tag || seenHashtags.has(tag.toLowerCase())) continue;
    seenHashtags.add(tag.toLowerCase());
    hashtags.push(tag);
  }

  // Defense in depth: V39.8 backend already materializes the Shopee affiliate
  // URL and hashtags. If an older queued payload is claimed after an update,
  // repair the description here instead of silently omitting the link/tags.
  if (
    affiliateUrl &&
    !publishText.includes(
      affiliateUrl,
    )
  ) {
    publishText = [
      publishText,
      `商品連結：${affiliateUrl}`,
      "部分連結為分潤連結",
    ]
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }

  const missingHashtags =
    hashtags.filter(
      (tag) => !publishText.includes(tag),
    );

  if (missingHashtags.length) {
    publishText = [
      publishText,
      missingHashtags.join(" "),
    ]
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }

  if (
    affiliateUrl &&
    !publishText.includes(
      affiliateUrl,
    )
  ) {
    throw new Error(
      "TIKTOK_AFFILIATE_LINK_MISSING",
    );
  }

  if (hashtags.length === 0) {
    throw new Error(
      "TIKTOK_HASHTAGS_MISSING",
    );
  }

  // TikTok Studio can keep an unfinished draft from the previous failed run.
  const staleDraft =
    await resolveTikTokStaleDraft(
      tabId,
      20000,
    );

  if (!staleDraft?.ok) {
    throw new Error(
      staleDraft?.reason ||
      "TIKTOK_STALE_DRAFT_BLOCKED",
    );
  }

  const fileInputReady =
    await waitForTikTokFileInput(
      tabId,
      30000,
    );

  if (!fileInputReady) {
    throw new Error(
      "TIKTOK_FILE_INPUT_NOT_READY",
    );
  }

  let fileInputResult = null;
  let autoFileError = "";

  await setPublisherPhase(
    "TIKTOK_LOADING_LOCAL_MP4",
    {
      rxvPublisherLastError: "",
    },
  );

  try {
    fileInputResult =
      await setTikTokVideoFileInput(
        tabId,
        job.videoPath,
        job.id,
      );

    await setPublisherPhase(
      "TIKTOK_LOCAL_MP4_SENT",
      {
        rxvPublisherLastError: "",
        rxvPublisherFileMode:
          String(
            fileInputResult?.eventMode ||
            "local-blob",
          ),
      },
    );
  } catch (error) {
    autoFileError =
      String(
        error?.message ||
        error ||
        "TIKTOK_AUTO_FILE_SELECT_FAILED",
      );

    // Do not terminate the job here. If TikTok changes its protected file input,
    // the user can select the MP4 once manually and RxV will continue with the
    // description/link/hashtags automatically in the same active job.
    await setPublisherPhase(
      "TIKTOK_WAITING_MANUAL_VIDEO",
      {
        rxvPublisherLastError:
          `自動選影片失敗，請手動選影片；選好後 RxV 會自動繼續填說明。${autoFileError ? ` (${autoFileError})` : ""}`,
      },
    );
  }

  const uploadReady =
    await waitTikTokUploadReady(
      tabId,
      autoFileError
        ? 180000
        : 90000,
    );

  if (!uploadReady) {
    if (autoFileError) {
      throw new Error(
        `TIKTOK_MANUAL_VIDEO_TIMEOUT:${autoFileError}`,
      );
    }

    throw new Error(
      "TIKTOK_UPLOAD_NOT_READY",
    );
  }

  if (uploadReady?.fatalStudioError) {
    // The file was accepted, but TikTok Studio's own video engine crashed.
    // Recover the page ONCE, then fall back to a manual file pick. We do not
    // auto-inject the same file again, otherwise Studio can enter a crash loop.
    await setPublisherPhase(
      "TIKTOK_RECOVERING_AUTO_UPLOAD_ERROR",
      {
        rxvPublisherLastError:
          "TikTok 接到影片後頁面出錯，RxV 正在重試頁面；重試後請手動選影片，之後會自動續填分潤連結與 Hashtag。",
      },
    );

    const retried = await clickVisibleText(
      tabId,
      ["重試", "Retry", "Try again", "再試一次"],
      8000,
    );

    if (!retried) {
      throw new Error(
        `TIKTOK_STUDIO_FATAL_ERROR_AFTER_AUTO_FILE:${JSON.stringify(uploadReady)}`,
      );
    }

    await sleep(1800);
    await waitForTikTokFileInput(tabId, 30000);

    autoFileError =
      "TIKTOK_STUDIO_FATAL_ERROR_AFTER_AUTO_FILE";

    await setPublisherPhase(
      "TIKTOK_WAITING_MANUAL_VIDEO_AFTER_RETRY",
      {
        rxvPublisherLastError:
          "TikTok 自動選片後曾出錯；頁面已重試。請手動選同一支 MP4，選好後 RxV 會自動續填說明、分潤連結與 Hashtag。",
      },
    );

    const manualReady =
      await waitTikTokUploadReady(
        tabId,
        180000,
      );

    if (!manualReady) {
      throw new Error(
        "TIKTOK_MANUAL_VIDEO_TIMEOUT_AFTER_RETRY",
      );
    }

    if (manualReady?.fatalStudioError) {
      throw new Error(
        `TIKTOK_STUDIO_FATAL_ERROR_AFTER_MANUAL_FILE:${JSON.stringify(manualReady)}`,
      );
    }
  }

  await setPublisherPhase(
    "TIKTOK_FILLING_DESCRIPTION",
    {
      rxvPublisherLastError: "",
    },
  );

  // TikTok auto-fills the description from the filename.
  // Wait until that finishes, then overwrite it.
  await sleep(1200);

  let verification = null;

  for (
    let attempt = 0;
    attempt < 3;
    attempt += 1
  ) {
    await insertTikTokDescriptionNative(
      tabId,
      publishText,
    );

    verification =
      await verifyTikTokDescription(
        tabId,
        publishText,
        affiliateUrl,
      );

    if (verification?.ok) {
      break;
    }

    await sleep(900);
  }

  if (!verification?.ok) {
    const details = [
      verification?.hasLink
        ? "link=ok"
        : "link=missing",
      verification?.hasKeywords
        ? "hashtags=ok"
        : "hashtags=missing",
      `actual=${
        Number(
          verification?.actualLength ||
          0,
        )
      }`,
      `expected=${
        Number(
          verification?.expectedLength ||
          0,
        )
      }`,
    ].join(",");

    throw new Error(
      `TIKTOK_DESCRIPTION_VERIFY_FAILED:${details}`,
    );
  }

  if (
    String(
      job.finalPublishMode ||
      "manual",
    ) === "auto"
  ) {
    const clicked =
      await clickTikTokPublish(
        tabId,
        60000,
      );

    if (!clicked?.ok) {
      throw new Error(
        "TIKTOK_FINAL_PUBLISH_NOT_CLICKED",
      );
    }

    const published =
      await waitTikTokPublished(
        tabId,
        90000,
      );

    if (!published?.ok) {
      return {
        prepared: true,
        published: false,
        autoPublishAttempted: true,
        autoPublished: false,
        warning:
          "TIKTOK_PUBLISH_UNCONFIRMED",
        descriptionVerified: true,
        hasAffiliateLink: true,
        hashtagCount:
          hashtags.length,
        autoFileSelected:
          !autoFileError,
        manualFileFallback:
          Boolean(autoFileError),
      };
    }

    return {
      prepared: false,
      published: true,
      autoPublishAttempted: true,
      autoPublished: true,
      publishedUrl:
        published.publishedUrl ||
        "",
      descriptionVerified: true,
      fileInput: fileInputResult,
      hasAffiliateLink: true,
      hashtagCount:
        hashtags.length,
      autoFileSelected:
        !autoFileError,
      manualFileFallback:
        Boolean(autoFileError),
      warning: "",
    };
  }

  const finalReady =
    await waitForFinalButton(
      tabId,
      "tiktok",
      60000,
    );

  if (!finalReady) {
    throw new Error(
      "TIKTOK_FINAL_BUTTON_NOT_READY",
    );
  }

  return {
    prepared: true,
    published: false,
    autoPublishAttempted: false,
    autoPublished: false,
    descriptionVerified: true,
    fileInput: fileInputResult,
    hasAffiliateLink: true,
    hashtagCount:
      hashtags.length,
    autoFileSelected:
      !autoFileError,
    manualFileFallback:
      Boolean(autoFileError),
    warning: "",
  };
}

async function reportResult(job, status, debug = {}, error = "") {
  await fetch(`${RXV_BASE}/publisher-extension/result`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: job.id, status, debug, error }),
  });
}

async function reportFail(job, error, debug = {}) {
  await fetch(`${RXV_BASE}/publisher-extension/fail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: job.id, error, debug }),
  }).catch(() => {});
}

async function handleJob(job) {
  if (activeJob) {
    return {
      ok: false,
      busy: true,
      activeJobId:
        activeJob?.id || "",
    };
  }

  activeJob = job;

  await chrome.storage.local.set({
    rxvPublisherActiveJobId:
      job.id,
  });

  await setPublisherPhase(
    "OPENING_PLATFORM",
    {
      rxvPublisherLastJobId:
        String(job.id || ""),
      rxvPublisherLastPlatform:
        String(job.platform || ""),
      rxvPublisherLastError: "",
    },
  );

  try {
    const tab =
      await getOrCreatePlatformTab(job);

    await setPublisherPhase(
      "PLATFORM_TAB_READY",
      {
        rxvPublisherLastUrl:
          String(
            tab?.url || "",
          ).split("?")[0],
      },
    );
    if (await detectLoginRequired(tab.id, job.platform)) {
      await reportResult(job, "login_required", {
        url: String(tab.url || "").split("?")[0],
        message: "請在這個正常 Edge 分頁人工登入一次，再回 RxV 重新測試。",
      }, "EXTENSION_LOGIN_REQUIRED");
      return;
    }

    let debug = null;
    if (job.platform === "facebook") {
      await setPublisherPhase(
        "FACEBOOK_PREPARING",
      );
      debug =
        await prepareFacebook(
          job,
          tab.id,
        );
    } else if (job.platform === "tiktok") {
      await setPublisherPhase(
        "TIKTOK_PREPARING",
      );
      debug =
        await prepareTikTok(
          job,
          tab.id,
        );
    } else {
      throw new Error("PLATFORM_NOT_SUPPORTED");
    }

    const current =
      await chrome.tabs
        .get(tab.id)
        .catch(() => tab);

    const autoPublished =
      Boolean(
        debug?.published,
      );

    await reportResult(
      job,
      autoPublished
        ? "published"
        : "prepared",
      {
        ...debug,
        url:
          String(
            current?.url || "",
          ).split("?")[0],
        publishedUrl:
          String(
            debug?.publishedUrl ||
            current?.url ||
            "",
          ).split("?")[0],
        normalEdge: true,
        finalPublishManual:
          !autoPublished,
      },
    );

    await setPublisherPhase(
      autoPublished
        ? "PUBLISHED"
        : "PREPARED",
      {
        rxvPublisherLastError: "",
      },
    );

    return {
      ok: true,
      published:
        autoPublished,
      prepared:
        !autoPublished,
    };
  } catch (error) {
    const errorText =
      String(
        error?.message || error,
      );

    await setPublisherPhase(
      "FAILED",
      {
        rxvPublisherLastError:
          errorText,
      },
    );

    await reportFail(
      job,
      errorText,
      {
        normalEdge: true,
        platform: job.platform,
      },
    );

    return {
      ok: false,
      error:
        errorText,
    };
  } finally {
    activeJob = null;

    await chrome.storage.local
      .remove(
        "rxvPublisherActiveJobId",
      );
  }
}

chrome.runtime.onMessage.addListener(
  (
    message,
    _sender,
    sendResponse,
  ) => {
    if (
      message?.type ===
      "RXV_PUBLISHER_WAKE"
    ) {
      pollAndRunNextJob(
        String(
          message?.source ||
          "runtime",
        ),
      )
        .then((result) =>
          sendResponse(
            result || {
              ok: true,
            },
          ),
        )
        .catch((error) =>
          sendResponse({
            ok: false,
            error:
              String(
                error?.message ||
                error,
              ),
          }),
        );

      // Keep the MV3 message event alive until polling / upload finishes.
      return true;
    }

    if (
      message?.type ===
        "RXV_PUBLISHER_JOB" &&
      message.job
    ) {
      handleJob(message.job)
        .then((result) =>
          sendResponse(
            result || {
              ok: true,
            },
          ),
        )
        .catch((error) =>
          sendResponse({
            ok: false,
            error:
              String(
                error?.message ||
                error,
              ),
          }),
        );

      // Critical V39.4 fix: do not send an immediate response and let
      // Edge suspend the service worker during upload.
      return true;
    }

    if (
      message?.type ===
      "RXV_PUBLISHER_STATE"
    ) {
      chrome.storage.local
        .get([
          "rxvPublisherPhase",
          "rxvPublisherLastError",
          "rxvPublisherLastJobId",
          "rxvPublisherLastPlatform",
          "rxvPublisherLastUpdate",
          "rxvPublisherFileMode",
        ])
        .then((stored) => {
          sendResponse({
            ok: true,
            activeJobId:
              activeJob?.id || "",
            phase:
              stored?.rxvPublisherPhase ||
              "",
            lastError:
              stored?.rxvPublisherLastError ||
              "",
            lastJobId:
              stored?.rxvPublisherLastJobId ||
              "",
            lastPlatform:
              stored?.rxvPublisherLastPlatform ||
              "",
            lastUpdate:
              stored?.rxvPublisherLastUpdate ||
              0,
            fileMode:
              stored?.rxvPublisherFileMode ||
              "",
            lastWakeAt,
          });
        })
        .catch(() => {
          sendResponse({
            ok: true,
            activeJobId:
              activeJob?.id || "",
          });
        });

      return true;
    }

    if (
      message?.type ===
      "RXV_ENSURE_OFFSCREEN"
    ) {
      ensureOffscreen()
        .then(() =>
          sendResponse({
            ok: true,
          }),
        )
        .catch((error) =>
          sendResponse({
            ok: false,
            error:
              String(
                error?.message ||
                error,
              ),
          }),
        );

      return true;
    }

    return false;
  },
);
