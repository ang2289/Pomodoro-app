import test from "node:test";
import assert from "node:assert/strict";
import { planStickerReadableLayout } from "../src/lib/stickerReadableLayout";

const sample = (w: number, h: number, draw: (rect: (x: number,y: number,width: number,height: number)=>void)=>void) => {
  const bytes = new Uint8ClampedArray(w*h*4);
  const rect = (x:number,y:number,width:number,height:number) => {
    for(let yy=y; yy<y+height; yy++) for(let xx=x; xx<x+width; xx++) bytes[(yy*w+xx)*4+3]=255;
  };
  draw(rect);
  return bytes;
};

test("isolated caption gets more room while preserving safe edges", () => {
  const pixels=sample(400,400,rect=>{rect(65,48,270,55);rect(125,119,150,235);});
  const plan=planStickerReadableLayout(pixels,400,400,370,320);
  assert.ok(plan);
  assert.deepEqual(plan.title.source,{x:65,y:48,width:270,height:55});
  assert.deepEqual(plan.body.source,{x:125,y:119,width:150,height:235});
  assert.ok(plan.title.target.width>plan.body.target.width);
  for(const region of [plan.title.target,plan.body.target]) {
    assert.ok(region.x>=20 && region.x+region.width<=350);
    assert.ok(region.y>=20 && region.y+region.height<=300);
  }
  assert.ok(plan.title.target.y+plan.title.target.height<plan.body.target.y);
});

test("touching caption/hair never gets destructively split", () => {
  const pixels=sample(400,400,rect=>{rect(50,30,300,75);rect(195,90,10,250);rect(90,130,220,225);});
  assert.equal(planStickerReadableLayout(pixels,400,400,370,320),null);
});

test("opaque and empty input fall back to normal layout", () => {
  assert.equal(planStickerReadableLayout(new Uint8ClampedArray(400*400*4),400,400,370,320),null);
  const pixels=sample(400,400,rect=>rect(0,0,400,400));
  assert.equal(planStickerReadableLayout(pixels,400,400,370,320),null);
});
