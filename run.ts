import { generateBatchVideos } from "./src/shopee-video/batch-run";

generateBatchVideos({
  csvPath: "./data/shopee-list.csv",
  outputRoot: "./output-videos",
  limit: 100,                    //想產生100部
  bgm: "./bgm/mellow.mp3",       //背景音樂
  style: "life",
  resolution: { w: 1080, h: 1920 }
});












































