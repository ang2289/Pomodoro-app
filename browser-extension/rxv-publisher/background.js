const RXV_BASE = "http://localhost:3006";
const RXV_PIN_BASE = "http://127.0.0.1:3018";
const VERSION = "39.21.0";
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

  let data = {};
  if (res?.ok) {
    data = await res.json().catch(() => ({}));
  }

  const explicitPinterestWake =
    source === "pinterest-button" ||
    source === "popup-pinterest";

  if (!data?.job && explicitPinterestWake) {
    const pinterestRes = await fetch(
      RXV_PIN_BASE + "/api/pinterest/next",
    ).catch(() => null);

    if (pinterestRes?.ok) {
      const pinterestData =
        await pinterestRes.json().catch(() => ({}));

      if (pinterestData?.job) {
        data = pinterestData;
      }
    } else if (!res?.ok) {
      await setPublisherPhase(
        "QUEUE_FETCH_FAILED",
        {
          rxvPublisherLastError:
            "RXV_QUEUES_UNAVAILABLE",
        },
      );

      return {
        ok: false,
        error:
          "RXV_QUEUES_UNAVAILABLE",
      };
    }
  }

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
  const jobResult = await handleJob(data.job);

  return {
    ok: Boolean(jobResult?.ok !== false),
    handled: true,
    jobId: String(data.job.id || ""),
    source,
    jobResult: jobResult || null,
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
  if (platform === "pinterest") return "pinterest.com";
  return "";
}

async function getOrCreatePlatformTab(job) {
  const domain = platformDomain(job.platform);
  const tabs = await chrome.tabs.query({});

  if (job.platform === "pinterest") {
    const creatorTabs = tabs
      .filter((item) =>
        String(item.url || "")
          .includes("pinterest.com/pin-creation-tool"),
      )
      .sort((a, b) => {
        if (Boolean(a.active) !== Boolean(b.active)) {
          return Number(b.active) - Number(a.active);
        }

        return Number(b.lastAccessed || 0) -
          Number(a.lastAccessed || 0);
      });

    let tab = creatorTabs[0] || null;

    // Guarantee one creator tab, even if older tests left duplicates.
    const extras = creatorTabs.slice(1);
    for (const extra of extras) {
      await chrome.tabs
        .remove(extra.id)
        .catch(() => {});
    }

    if (!tab) {
      tab = await chrome.tabs.create({
        url: job.targetUrl,
        active: true,
      });
    } else {
      await chrome.tabs.update(tab.id, {
        active: true,
      });
    }

    await waitTabComplete(
      tab.id,
      45000,
    );

    await sleep(700);

    return chrome.tabs.get(tab.id);
  }

  let tab = tabs.find((item) =>
    String(item.url || "")
      .includes(domain),
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

  await waitTabComplete(
    tab.id,
    45000,
  );

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
    if (platform === "pinterest") {
      return (
        /\/login(?:\/|\?|$)/.test(url) ||
        body.includes("登入 pinterest") ||
        body.includes("log in to pinterest") ||
        body.includes("sign in to pinterest")
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

async function ensurePinterestFreshDraft(tabId, timeoutMs = 15000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const state = await exec(tabId, () => {
      const visible = (el) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
      };

      const directFile = Array.from(document.querySelectorAll('input[type="file"]')).find(visible);
      if (directFile) {
        return { ready: true, reason: "FILE_INPUT_READY" };
      }

      const bodyText = String(document.body?.innerText || "");
      const hasUploadArea =
        bodyText.includes("上傳媒體") ||
        bodyText.includes("Upload media") ||
        bodyText.includes("拖放") ||
        bodyText.includes("drag and drop");

      if (hasUploadArea) {
        // Pinterest can keep the real input hidden. The debugger fallback can still see it.
        return { ready: true, reason: "UPLOAD_AREA_READY" };
      }

      const buttons = Array.from(
        document.querySelectorAll('button,[role="button"],a'),
      ).filter(visible);

      const addLabels = new Set([
        "新增",
        "建立 Pin",
        "建立 pin",
        "Create Pin",
        "Create pin",
        "New",
      ]);

      const add = buttons.find((el) => {
        const t = String(el.innerText || el.textContent || "").trim();
        if (!addLabels.has(t)) return false;
        if (el.disabled || el.getAttribute("aria-disabled") === "true") return false;
        return true;
      });

      if (add) {
        add.scrollIntoView({ block: "center" });
        add.click();
        return { ready: false, clickedAdd: true, text: String(add.innerText || add.textContent || "").trim() };
      }

      return {
        ready: false,
        clickedAdd: false,
        bodySample: bodyText.slice(0, 500),
      };
    }).catch(() => ({ ready: false }));

    if (state?.ready) return state;
    await sleep(state?.clickedAdd ? 900 : 500);
  }

  throw new Error("PINTEREST_NEW_DRAFT_NOT_READY");
}

async function clickPinterestUploadArea(tabId) {
  return await exec(tabId, () => {
    const visible = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
    };

    const phrases = [
      "上傳媒體",
      "Upload media",
      "選擇檔案",
      "Choose a file",
      "拖放",
      "drag and drop",
    ];

    const nodes = Array.from(
      document.querySelectorAll('button,[role="button"],label,div,span'),
    ).filter(visible);

    let best = null;
    let bestScore = -1;

    for (const el of nodes) {
      const text = String(el.innerText || el.textContent || "").trim();
      if (!text || text.length > 400) continue;

      let score = 0;
      const lower = text.toLowerCase();
      for (const phrase of phrases) {
        const p = phrase.toLowerCase();
        if (lower === p) score += 300;
        else if (lower.includes(p)) score += 120;
      }

      if (el.matches('button,[role="button"],label')) score += 40;
      const r = el.getBoundingClientRect();
      if (r.width > 180 && r.height > 120) score += 35;

      if (score > bestScore) {
        best = el;
        bestScore = score;
      }
    }

    if (!best || bestScore < 100) {
      return { ok: false, reason: "PINTEREST_UPLOAD_AREA_NOT_FOUND" };
    }

    const clickable =
      best.closest('button,[role="button"],label') ||
      best.parentElement ||
      best;

    const r = clickable.getBoundingClientRect();
    clickable.scrollIntoView({ block: "center" });

    try {
      clickable.click();
    } catch (_) {}

    return {
      ok: true,
      score: bestScore,
      x: Math.max(1, Math.round(r.left + r.width / 2)),
      y: Math.max(1, Math.round(r.top + r.height / 2)),
      text: String(best.innerText || best.textContent || "").trim().slice(0, 120),
    };
  });
}

async function setPinterestFileInputViaChooser(tabId, filePath, timeoutMs = 20000) {
  let attached = false;
  let listener = null;

  try {
    await chrome.debugger.attach({ tabId }, "1.3");
    attached = true;

    await chrome.debugger.sendCommand({ tabId }, "Page.enable").catch(() => {});
    await chrome.debugger.sendCommand({ tabId }, "DOM.enable").catch(() => {});
    await chrome.debugger.sendCommand(
      { tabId },
      "Page.setInterceptFileChooserDialog",
      { enabled: true },
    );

    let resolveChooser;
    const chooserPromise = new Promise((resolve) => {
      resolveChooser = resolve;
    });

    listener = (source, method, params) => {
      if (Number(source?.tabId || 0) !== Number(tabId)) return;
      if (method !== "Page.fileChooserOpened") return;
      resolveChooser(params || {});
    };

    chrome.debugger.onEvent.addListener(listener);

    const clicked = await clickPinterestUploadArea(tabId);
    if (!clicked?.ok) {
      throw new Error(clicked?.reason || "PINTEREST_UPLOAD_AREA_NOT_FOUND");
    }

    const waitForChooser = async (ms) =>
      await Promise.race([
        chooserPromise,
        sleep(ms).then(() => null),
      ]);

    let chooser = await waitForChooser(2500);

    // Some Pinterest builds ignore HTMLElement.click() but respond to a real mouse event.
    if (!chooser && Number(clicked.x) > 0 && Number(clicked.y) > 0) {
      await chrome.debugger.sendCommand(
        { tabId },
        "Input.dispatchMouseEvent",
        {
          type: "mousePressed",
          x: Number(clicked.x),
          y: Number(clicked.y),
          button: "left",
          clickCount: 1,
        },
      ).catch(() => {});
      await chrome.debugger.sendCommand(
        { tabId },
        "Input.dispatchMouseEvent",
        {
          type: "mouseReleased",
          x: Number(clicked.x),
          y: Number(clicked.y),
          button: "left",
          clickCount: 1,
        },
      ).catch(() => {});

      chooser = await waitForChooser(Math.max(1000, timeoutMs - 2500));
    }

    const backendNodeId = Number(chooser?.backendNodeId || 0);
    if (!backendNodeId) {
      throw new Error("PINTEREST_FILE_CHOOSER_NOT_OPENED");
    }

    await chrome.debugger.sendCommand(
      { tabId },
      "DOM.setFileInputFiles",
      {
        backendNodeId,
        files: [filePath],
      },
    );

    return {
      ok: true,
      mode: "native-file-chooser",
      backendNodeId,
      uploadText: String(clicked.text || ""),
    };
  } finally {
    if (listener) {
      try {
        chrome.debugger.onEvent.removeListener(listener);
      } catch (_) {}
    }

    if (attached) {
      await chrome.debugger.sendCommand(
        { tabId },
        "Page.setInterceptFileChooserDialog",
        { enabled: false },
      ).catch(() => {});
      await chrome.debugger.detach({ tabId }).catch(() => {});
    }
  }
}

async function setPinterestFileInputViaBlob(tabId, job) {
  const response = await fetch(
    RXV_PIN_BASE + "/api/pinterest/file?id=" + encodeURIComponent(String(job.id || "")),
  );

  if (!response.ok) {
    throw new Error("PINTEREST_LOCAL_IMAGE_HTTP_" + response.status);
  }

  const contentType = String(response.headers.get("content-type") || "image/jpeg").split(";")[0];
  const fileName = String(
    response.headers.get("x-rxv-filename") ||
    ("rxv-pinterest-" + Date.now() + (contentType.includes("png") ? ".png" : contentType.includes("webp") ? ".webp" : ".jpg")),
  );

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.length) throw new Error("PINTEREST_LOCAL_IMAGE_EMPTY");

  // Chunk size is divisible by 3 so Base64 chunks can be concatenated safely.
  const chunkSize = 24576;
  let base64 = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(bytes.length, i + chunkSize));
    let binary = "";
    for (let j = 0; j < chunk.length; j += 1) binary += String.fromCharCode(chunk[j]);
    base64 += btoa(binary);
  }

  const result = await exec(tabId, (base64, fileName, contentType) => {
    function findFileInput(root) {
      if (!root) return null;
      const direct = root.querySelector?.('input[type="file"]');
      if (direct) return direct;

      const all = root.querySelectorAll?.("*") || [];
      for (const el of all) {
        if (el.shadowRoot) {
          const found = findFileInput(el.shadowRoot);
          if (found) return found;
        }
      }
      return null;
    }

    const input = findFileInput(document);
    if (!input) return { ok: false, reason: "PINTEREST_FILE_INPUT_NOT_FOUND_IN_PAGE" };

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

    const blob = new Blob([bytes], { type: contentType });
    const file = new File([blob], fileName, { type: contentType, lastModified: Date.now() });
    const dt = new DataTransfer();
    dt.items.add(file);

    input.files = dt.files;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

    return {
      ok: Boolean(input.files && input.files.length),
      fileCount: input.files ? input.files.length : 0,
      fileName: input.files?.[0]?.name || "",
    };
  }, [base64, fileName, contentType]);

  if (!result?.ok) {
    throw new Error(result?.reason || "PINTEREST_BLOB_FILE_SET_FAILED");
  }

  return { ok: true, mode: "blob-datatransfer", ...result };
}

async function setPinterestFileInput(tabId, filePath, timeoutMs = 30000) {
  let attached = false;
  const started = Date.now();

  try {
    await chrome.debugger.attach({ tabId }, "1.3");
    attached = true;
    await chrome.debugger.sendCommand({ tabId }, "DOM.enable").catch(() => {});

    while (Date.now() - started < timeoutMs) {
      // Pinterest may place its upload input inside a shadow root or nested frame.
      const flat = await chrome.debugger.sendCommand(
        { tabId },
        "DOM.getFlattenedDocument",
        { depth: -1, pierce: true },
      ).catch(() => null);

      const nodes = Array.isArray(flat?.nodes) ? flat.nodes : [];
      let backendNodeId = 0;

      for (const node of nodes) {
        if (String(node?.nodeName || "").toUpperCase() !== "INPUT") continue;
        const attrs = Array.isArray(node?.attributes) ? node.attributes : [];
        let type = "";
        for (let i = 0; i < attrs.length - 1; i += 2) {
          if (String(attrs[i] || "").toLowerCase() === "type") {
            type = String(attrs[i + 1] || "").toLowerCase();
            break;
          }
        }
        if (type === "file") {
          backendNodeId = Number(node.backendNodeId || 0);
          if (backendNodeId) break;
        }
      }

      if (backendNodeId) {
        await chrome.debugger.sendCommand(
          { tabId },
          "DOM.setFileInputFiles",
          { backendNodeId, files: [filePath] },
        );
        return { ok: true, mode: "flattened", backendNodeId };
      }

      // Fallback for ordinary DOM.
      const doc = await chrome.debugger.sendCommand(
        { tabId },
        "DOM.getDocument",
        { depth: -1, pierce: true },
      ).catch(() => null);

      if (doc?.root?.nodeId) {
        const result = await chrome.debugger.sendCommand(
          { tabId },
          "DOM.querySelectorAll",
          { nodeId: doc.root.nodeId, selector: 'input[type="file"]' },
        ).catch(() => null);

        const nodeId = Array.isArray(result?.nodeIds) ? Number(result.nodeIds[0] || 0) : 0;
        if (nodeId) {
          await chrome.debugger.sendCommand(
            { tabId },
            "DOM.setFileInputFiles",
            { nodeId, files: [filePath] },
          );
          return { ok: true, mode: "querySelector", nodeId };
        }
      }

      await sleep(500);
    }

    throw new Error("PINTEREST_FILE_INPUT_NOT_FOUND");
  } finally {
    if (attached) {
      await chrome.debugger.detach({ tabId }).catch(() => {});
    }
  }
}

async function waitForPinterestEditorFields(tabId, timeoutMs = 90000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const state = await exec(tabId, () => {
      const visible = (el) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
      };

      const bodyText = String(document.body?.innerText || "");
      const lower = bodyText.toLowerCase();

      const titleVisible =
        bodyText.includes("讓所有人知道你的 Pin 主題") ||
        bodyText.includes("讓所有人知道你的 pin 主題") ||
        bodyText.includes("標題") ||
        lower.includes("add a title");

      const descriptionVisible =
        bodyText.includes("請提供 Pin 的相關說明") ||
        bodyText.includes("請提供 pin 的相關說明") ||
        bodyText.includes("說明") ||
        lower.includes("description") ||
        lower.includes("tell everyone what your pin is about");

      const linkVisible =
        bodyText.includes("新增連結") ||
        bodyText.includes("連結") ||
        lower.includes("add a link") ||
        lower.includes("destination link");

      const fields = Array.from(
        document.querySelectorAll(
          'input,textarea,[contenteditable="true"],[role="textbox"],[data-lexical-editor="true"]',
        ),
      ).filter(visible);

      const attrs = fields.map((el) => [
        el.getAttribute("aria-label"),
        el.getAttribute("placeholder"),
        el.getAttribute("name"),
        el.getAttribute("data-test-id"),
        el.getAttribute("data-testid"),
      ].filter(Boolean).join(" ").toLowerCase());

      const attrTitle = attrs.some((a) => a.includes("標題") || a.includes("title"));
      const attrDesc = attrs.some((a) => a.includes("說明") || a.includes("description"));
      const attrLink = attrs.some((a) => a.includes("連結") || a.includes("link") || a.includes("destination"));

      return {
        ready:
          (titleVisible && descriptionVisible && linkVisible) ||
          ((titleVisible || attrTitle) && (descriptionVisible || attrDesc)) ||
          fields.length >= 3,
        titleVisible,
        descriptionVisible,
        linkVisible,
        fieldCount: fields.length,
        attrTitle,
        attrDesc,
        attrLink,
      };
    }).catch(() => ({ ready: false }));

    if (state?.ready) return state;
    await sleep(500);
  }

  return {
    ready: false,
    reason: "PINTEREST_EDITOR_DETECT_TIMEOUT",
  };
}

async function fillPinterestFieldByKeyboard(tabId, kind, value) {
  const text = String(value || "").trim();
  if (!text) return { ok: true, skipped: true, kind };

  let attached = false;

  try {
    await chrome.debugger.attach({ tabId }, "1.3");
    attached = true;

    const target = await exec(tabId, (kind) => {
      const visible = (el) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
      };

      const hints = {
        title: [
          "讓所有人知道你的 Pin 主題",
          "讓所有人知道你的 pin 主題",
          "新增標題",
          "標題",
          "Add a title",
        ],
        description: [
          "請提供 Pin 的相關說明",
          "請提供 pin 的相關說明",
          "說明",
          "Description",
          "Tell everyone what your Pin is about",
        ],
        link: [
          "新增連結",
          "連結",
          "Add a link",
          "Destination link",
        ],
      };

      const wanted = (hints[kind] || []).map((x) => x.toLowerCase());

      const nodes = Array.from(
        document.querySelectorAll(
          'input,textarea,[contenteditable="true"],[role="textbox"],[data-lexical-editor="true"],label,div,span,p',
        ),
      ).filter(visible);

      let best = null;
      let bestScore = -1;

      for (const el of nodes) {
        const attrs = [
          el.getAttribute?.("aria-label"),
          el.getAttribute?.("placeholder"),
          el.getAttribute?.("name"),
        ].filter(Boolean).join(" ");

        const ownText = String(el.innerText || el.textContent || "");
        const combined = (attrs + " " + ownText).trim().toLowerCase();

        let score = 0;
        for (const hint of wanted) {
          if (!hint) continue;
          if (combined === hint) score += 400;
          else if (combined.includes(hint)) score += 180;
        }

        if (
          el.matches?.(
            'input,textarea,[contenteditable="true"],[role="textbox"],[data-lexical-editor="true"]',
          )
        ) {
          score += 120;
        }

        if (score > bestScore) {
          best = el;
          bestScore = score;
        }
      }

      if (!best || bestScore < 100) {
        return {
          ok: false,
          reason: "PINTEREST_FIELD_TARGET_NOT_FOUND",
          kind,
        };
      }

      let clickable = best;

      if (
        !clickable.matches?.(
          'input,textarea,[contenteditable="true"],[role="textbox"],[data-lexical-editor="true"]',
        )
      ) {
        let container = best.parentElement;
        let found = null;

        for (let depth = 0; depth < 5 && container; depth += 1, container = container.parentElement) {
          found = Array.from(
            container.querySelectorAll(
              'input,textarea,[contenteditable="true"],[role="textbox"],[data-lexical-editor="true"]',
            ),
          ).find(visible);

          if (found) break;
        }

        clickable = found || best.parentElement || best;
      }

      const r = clickable.getBoundingClientRect();
      clickable.scrollIntoView({ block: "center" });

      return {
        ok: true,
        x: Math.max(1, Math.round(r.left + Math.min(r.width * 0.35, 180))),
        y: Math.max(1, Math.round(r.top + r.height / 2)),
        kind,
      };
    }, [kind]);

    if (!target?.ok) return target;

    await chrome.debugger.sendCommand(
      { tabId },
      "Input.dispatchMouseEvent",
      {
        type: "mousePressed",
        x: Number(target.x),
        y: Number(target.y),
        button: "left",
        clickCount: 1,
      },
    );

    await chrome.debugger.sendCommand(
      { tabId },
      "Input.dispatchMouseEvent",
      {
        type: "mouseReleased",
        x: Number(target.x),
        y: Number(target.y),
        button: "left",
        clickCount: 1,
      },
    );

    await sleep(120);

    await chrome.debugger.sendCommand(
      { tabId },
      "Input.dispatchKeyEvent",
      {
        type: "keyDown",
        key: "a",
        code: "KeyA",
        modifiers: 2,
      },
    ).catch(() => {});

    await chrome.debugger.sendCommand(
      { tabId },
      "Input.dispatchKeyEvent",
      {
        type: "keyUp",
        key: "a",
        code: "KeyA",
        modifiers: 2,
      },
    ).catch(() => {});

    await chrome.debugger.sendCommand(
      { tabId },
      "Input.insertText",
      { text },
    );

    await sleep(200);

    const verified = await exec(tabId, (kind, text) => {
      const body = String(document.body?.innerText || "");
      if (body.includes(text)) return true;

      const fields = Array.from(
        document.querySelectorAll(
          'input,textarea,[contenteditable="true"],[role="textbox"],[data-lexical-editor="true"]',
        ),
      );

      return fields.some((el) => {
        const value =
          el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
            ? String(el.value || "")
            : String(el.innerText || el.textContent || "");
        return value.includes(text.slice(0, Math.min(30, text.length)));
      });
    }, [kind, text]).catch(() => false);

    return {
      ok: Boolean(verified),
      kind,
      mode: "debugger-keyboard",
    };
  } finally {
    if (attached) {
      await chrome.debugger.detach({ tabId }).catch(() => {});
    }
  }
}

async function fillPinterestFieldVisual(tabId, kind, value) {
  const text = String(value || "").trim();

  if (!text) {
    return {
      ok: true,
      skipped: true,
      kind,
    };
  }

  let attached = false;

  try {
    await chrome.debugger.attach(
      { tabId },
      "1.3",
    );

    attached = true;

    const target = await exec(
      tabId,
      (kind) => {
        const visible = (el) => {
          if (!el) return false;

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

        const phrases = {
          title: [
            "讓所有人知道你的 Pin 主題",
            "讓所有人知道你的 pin 主題",
            "新增標題",
            "Add a title",
          ],
          description: [
            "請提供 Pin 的相關說明",
            "請提供 pin 的相關說明",
            "Tell everyone what your Pin is about",
          ],
          link: [
            "新增連結",
            "Add a link",
            "Destination link",
          ],
        };

        const wanted =
          phrases[kind] || [];

        const all =
          Array.from(
            document.querySelectorAll(
              "input,textarea,[contenteditable='true'],[role='textbox'],[data-lexical-editor='true'],div,span,p",
            ),
          );

        let best = null;
        let bestScore = -1;

        for (const el of all) {
          if (!visible(el)) continue;

          const attrs = [
            el.getAttribute?.(
              "placeholder",
            ),
            el.getAttribute?.(
              "aria-label",
            ),
          ]
            .filter(Boolean)
            .join(" ");

          const own =
            String(
              el.innerText ||
              el.textContent ||
              "",
            )
              .trim();

          const combined =
            (attrs + " " + own)
              .trim()
              .toLowerCase();

          let score = 0;

          for (const phrase of wanted) {
            const p =
              phrase.toLowerCase();

            if (
              attrs
                .toLowerCase()
                .includes(p)
            ) {
              score += 600;
            }

            if (
              own
                .toLowerCase() === p
            ) {
              score += 500;
            } else if (
              combined.includes(p)
            ) {
              score += 220;
            }
          }

          if (
            el.matches?.(
              "input,textarea,[contenteditable='true'],[role='textbox'],[data-lexical-editor='true']",
            )
          ) {
            score += 160;
          }

          // Avoid giant wrapper containers that include the whole form.
          const r =
            el.getBoundingClientRect();

          if (
            r.width > 650 ||
            r.height > 220
          ) {
            score -= 180;
          }

          if (score > bestScore) {
            best = el;
            bestScore = score;
          }
        }

        if (
          !best ||
          bestScore < 180
        ) {
          return {
            ok: false,
            reason:
              "PINTEREST_VISUAL_TARGET_NOT_FOUND",
            kind,
            score: bestScore,
          };
        }

        best.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: "instant",
        });

        const r =
          best.getBoundingClientRect();

        return {
          ok: true,
          kind,
          score: bestScore,
          // Click slightly inside the placeholder / editor, not on the border.
          x: Math.max(
            1,
            Math.round(
              r.left +
              Math.min(
                Math.max(
                  28,
                  r.width * 0.25,
                ),
                180,
              ),
            ),
          ),
          y: Math.max(
            1,
            Math.round(
              r.top +
              r.height / 2,
            ),
          ),
        };
      },
      [kind],
    );

    if (!target?.ok) {
      return target;
    }

    // Real browser-level click.
    await chrome.debugger.sendCommand(
      { tabId },
      "Input.dispatchMouseEvent",
      {
        type: "mousePressed",
        x: Number(target.x),
        y: Number(target.y),
        button: "left",
        clickCount: 1,
      },
    );

    await chrome.debugger.sendCommand(
      { tabId },
      "Input.dispatchMouseEvent",
      {
        type: "mouseReleased",
        x: Number(target.x),
        y: Number(target.y),
        button: "left",
        clickCount: 1,
      },
    );

    await sleep(160);

    // Select existing content, clear, then type Unicode directly.
    await chrome.debugger.sendCommand(
      { tabId },
      "Input.dispatchKeyEvent",
      {
        type: "keyDown",
        key: "a",
        code: "KeyA",
        modifiers: 2,
      },
    ).catch(() => {});

    await chrome.debugger.sendCommand(
      { tabId },
      "Input.dispatchKeyEvent",
      {
        type: "keyUp",
        key: "a",
        code: "KeyA",
        modifiers: 2,
      },
    ).catch(() => {});

    await chrome.debugger.sendCommand(
      { tabId },
      "Input.insertText",
      { text },
    );

    await sleep(300);

    const verified = await exec(
      tabId,
      (text) => {
        const prefix =
          text.slice(
            0,
            Math.min(
              24,
              text.length,
            ),
          );

        if (
          String(
            document.body?.innerText ||
            "",
          ).includes(prefix)
        ) {
          return true;
        }

        return Array.from(
          document.querySelectorAll(
            "input,textarea,[contenteditable='true'],[role='textbox'],[data-lexical-editor='true']",
          ),
        ).some((el) => {
          const v =
            el instanceof HTMLInputElement ||
            el instanceof HTMLTextAreaElement
              ? String(
                  el.value || "",
                )
              : String(
                  el.innerText ||
                  el.textContent ||
                  "",
                );

          return v.includes(prefix);
        });
      },
      [text],
    ).catch(() => false);

    return {
      ok:
        Boolean(
          verified,
        ),
      kind,
      mode:
        "visual-placeholder-keyboard",
      score:
        target.score,
    };
  } finally {
    if (attached) {
      await chrome.debugger
        .detach({ tabId })
        .catch(() => {});
    }
  }
}

async function fillPinterestFieldReliable(
  tabId,
  kind,
  value,
  timeoutMs = 30000,
) {
  const text =
    String(value || "")
      .trim();

  if (!text) {
    return {
      ok: true,
      skipped: true,
      kind,
    };
  }

  const started =
    Date.now();

  let last = null;

  while (
    Date.now() - started <
    timeoutMs
  ) {
    // Pinterest's current editor exposes visible placeholders more reliably
    // than stable input selectors, so try the visual target first.
    const visual =
      await fillPinterestFieldVisual(
        tabId,
        kind,
        text,
      ).catch(
        (error) => ({
          ok: false,
          reason:
            String(
              error?.message ||
              error,
            ),
        }),
      );

    if (visual?.ok) {
      return visual;
    }

    const dom =
      await fillPinterestField(
        tabId,
        kind,
        text,
      ).catch(
        (error) => ({
          ok: false,
          reason:
            String(
              error?.message ||
              error,
            ),
        }),
      );

    if (dom?.ok) {
      return {
        ...dom,
        mode:
          dom.mode ||
          "dom",
      };
    }

    const keyboard =
      await fillPinterestFieldByKeyboard(
        tabId,
        kind,
        text,
      ).catch(
        (error) => ({
          ok: false,
          reason:
            String(
              error?.message ||
              error,
            ),
        }),
      );

    if (keyboard?.ok) {
      return keyboard;
    }

    last = {
      visual,
      dom,
      keyboard,
    };

    await sleep(500);
  }

  return {
    ok: false,
    kind,
    reason:
      "PINTEREST_FIELD_FILL_TIMEOUT",
    last,
  };
}


async function selectPinterestBoard(tabId, boardName) {
  const wantedBoard = String(boardName || "").trim();
  if (!wantedBoard) {
    return { ok: false, skipped: true, reason: "BOARD_NAME_EMPTY" };
  }

  const opened = await exec(tabId, (wantedBoard) => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
    };
    const nodes = Array.from(document.querySelectorAll('button,[role="button"],[aria-haspopup="listbox"]'));
    let best = null;
    let bestScore = -999;

    for (const el of nodes) {
      if (!visible(el)) continue;
      const nodeText = String(el.innerText || el.textContent || "").trim();
      const aria = String(el.getAttribute("aria-label") || "");
      const combined = (nodeText + " " + aria).toLowerCase();
      let score = 0;

      if (combined.includes("選擇圖版") || combined.includes("選擇看板")) score += 120;
      if (combined.includes("choose board") || combined.includes("select board")) score += 120;
      if (combined.includes("圖版") || combined.includes("board")) score += 30;
      if (nodeText === wantedBoard) score += 80;
      if (combined.includes("發佈") || combined.includes("發布") || combined.includes("publish")) score -= 300;

      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    }

    if (!best || bestScore < 30) return { ok: false, reason: "BOARD_PICKER_NOT_FOUND", bestScore };
    best.scrollIntoView({ block: "center" });
    best.click();
    return { ok: true, score: bestScore };
  }, [wantedBoard]);

  if (!opened || !opened.ok) return opened;
  await sleep(700);

  const selected = await exec(tabId, (wantedBoard) => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
    };
    const exact = String(wantedBoard || "").trim().toLowerCase();
    const nodes = Array.from(
      document.querySelectorAll('[role="option"],[role="menuitem"],button,[role="button"],li,div'),
    );

    for (const el of nodes) {
      if (!visible(el)) continue;
      const nodeText = String(el.innerText || el.textContent || "").trim();
      if (!nodeText || nodeText.length > 120) continue;
      if (nodeText.toLowerCase() !== exact) continue;
      el.scrollIntoView({ block: "center" });
      el.click();
      return { ok: true, selected: nodeText };
    }

    return { ok: false, reason: "BOARD_NOT_FOUND", boardName: wantedBoard };
  }, [wantedBoard]);

  return selected;
}

async function preparePinterest(job, tabId) {
  await setPublisherPhase("PINTEREST_PREPARING_DRAFT", {
    rxvPublisherLastError: "",
  });

  await ensurePinterestFreshDraft(tabId, 15000);

  await setPublisherPhase("PINTEREST_UPLOADING_IMAGE", {
    rxvPublisherLastError: "",
  });

  let fileResult = null;
  let chooserError = "";
  let blobError = "";

  try {
    fileResult = await setPinterestFileInputViaChooser(
      tabId,
      job.imagePath,
      20000,
    );
  } catch (error) {
    chooserError = String(error?.message || error);
  }

  if (!fileResult) {
    try {
      fileResult = await setPinterestFileInputViaBlob(tabId, job);
    } catch (error) {
      blobError = String(error?.message || error);
    }
  }

  if (!fileResult) {
    fileResult = await setPinterestFileInput(
      tabId,
      job.imagePath,
      30000,
    );
    fileResult = {
      ...fileResult,
      fallbackFromChooser: chooserError,
      fallbackFromBlob: blobError,
    };
  }

  await setPublisherPhase("PINTEREST_WAITING_EDITOR", {
    rxvPublisherLastError: "",
  });

  const editorState =
    await waitForPinterestEditorFields(
      tabId,
      8000,
    );

  await setPublisherPhase(
    "PINTEREST_FILLING_FIELDS",
    {
      rxvPublisherLastError:
        editorState?.ready
          ? ""
          : "Pinterest 欄位尚在建立，RxV 已直接開始依畫面位置填入。",
    },
  );

  const title = await fillPinterestFieldReliable(
    tabId,
    "title",
    job.publishTitle,
    45000,
  );
  if (!title || !title.ok) {
    throw new Error("PINTEREST_TITLE_NOT_FILLED");
  }

  const description = await fillPinterestFieldReliable(
    tabId,
    "description",
    job.publishDescription || job.publishText,
    45000,
  );
  if (!description || !description.ok) {
    throw new Error("PINTEREST_DESCRIPTION_NOT_FILLED");
  }

  const link = await fillPinterestFieldReliable(
    tabId,
    "link",
    job.destinationUrl,
    30000,
  );
  if ((!link || !link.ok) && String(job.destinationUrl || "").trim()) {
    throw new Error("PINTEREST_LINK_NOT_FILLED");
  }

  await setPublisherPhase("PINTEREST_SELECTING_BOARD", {
    rxvPublisherLastError: "",
  });

  const board = await selectPinterestBoard(tabId, job.boardName);
  const warning = board && board.ok ? "" : String((board && board.reason) || "PINTEREST_BOARD_REVIEW_REQUIRED");

  const ai = await ensurePinterestAiLabel(tabId, Boolean(job.aiDisclosureRequested));

  const finalReady = await waitForFinalButton(tabId, "pinterest", 15000);

  return {
    prepared: true,
    published: false,
    fileInput: fileResult,
    titleFilled: Boolean(title && title.ok),
    descriptionFilled: Boolean(description && description.ok),
    linkFilled: Boolean((link && link.ok) || !String(job.destinationUrl || "").trim()),
    boardSelected: Boolean(board && board.ok),
    boardName: String(job.boardName || ""),
    aiDisclosureRequested: Boolean(job.aiDisclosureRequested),
    aiLabelFound: Boolean(ai && ai.found),
    aiLabelOn: Boolean(ai && ai.on),
    finalReady: Boolean(finalReady),
    warning,
  };
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
  const isPinterest =
    String(job?.queueSource || "") === "pinterest-3018";

  await fetch(
    isPinterest
      ? RXV_PIN_BASE + "/api/pinterest/result"
      : RXV_BASE + "/publisher-extension/result",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: job.id, status, debug, error }),
    },
  );
}

async function reportFail(job, error, debug = {}) {
  const isPinterest =
    String(job?.queueSource || "") === "pinterest-3018";

  await fetch(
    isPinterest
      ? RXV_PIN_BASE + "/api/pinterest/fail"
      : RXV_BASE + "/publisher-extension/fail",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: job.id, error, debug }),
    },
  ).catch(() => {});
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
    } else if (job.platform === "pinterest") {
      await setPublisherPhase(
        "PINTEREST_PREPARING",
      );
      debug =
        await preparePinterest(
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
