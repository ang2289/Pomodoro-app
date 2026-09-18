"use strict";
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const Module = require("node:module");

function loadBundledSource(prefix) {
  const files = fs.readdirSync(__dirname)
    .filter((name) => name.startsWith(prefix + ".src.b64.part-"))
    .sort();
  if (!files.length) throw new Error("RXV v2 video builder source bundle missing: " + prefix);
  const b64 = files.map((name) => fs.readFileSync(path.join(__dirname, name), "utf8").trim()).join("");
  return zlib.gunzipSync(Buffer.from(b64, "base64")).toString("utf8");
}

const source = loadBundledSource("rxv-video-builder-v2.cjs");
const inner = new Module(path.join(__dirname, "rxv-video-builder-v2.source.cjs"), module);
inner.filename = path.join(__dirname, "rxv-video-builder-v2.source.cjs");
inner.paths = module.paths;
inner._compile(source, inner.filename);
module.exports = inner.exports;
