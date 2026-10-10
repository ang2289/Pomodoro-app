import test from "node:test";
import assert from "node:assert/strict";
import { partitionWhatsAppPacks, WHATSAPP_STICKER_MAX_BYTES, WHATSAPP_STICKER_SIZE } from "../src/lib/whatsAppStickerExport";

test("WhatsApp 3-30 stickers in each pack", () => {
  for (const count of [3, 8, 16, 24, 30, 31, 32, 40, 60, 61, 64]) {
    const groups = partitionWhatsAppPacks(count);
    assert.equal(groups.reduce((a,b)=>a+b,0),count);
    assert.ok(groups.every(x => x >= 3 && x <= 30));
  }
});
test("reject fewer than 3 stickers",()=> {
  assert.throws(() => partitionWhatsAppPacks(2));
});
test("WhatsApp technical limits are conservative",()=> {
  assert.equal(WHATSAPP_STICKER_SIZE,512);
  assert.equal(WHATSAPP_STICKER_MAX_BYTES,100000);
});
