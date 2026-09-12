import React, { useEffect, useMemo, useState } from "react";
import strawberryBunnyImg from "../../assets/eat-no-fat/strawberry_bunny.png";
import bobaCatImg from "../../assets/eat-no-fat/boba_cat.png";
import broccoliSpriteImg from "../../assets/eat-no-fat/broccoli_sprite.png";
import puddingBearImg from "../../assets/eat-no-fat/pudding_bear.png";

type FoodCategory = "fruit" | "vegetable" | "snack";

type FoodItem = {
  id: string;
  name: string;
  enName: string;
  emoji: string;
  point: number;
  unlockPoint: number;
  category: FoodCategory;
  colorName: string;
  description: string;
};

type Character = {
  id: string;
  name: string;
  skill: string;
  favoriteCategory: FoodCategory | "all";
  image: string;
  theme: "pink" | "orange" | "green" | "yellow";
};

type GameState = {
  happyPoint: number;
  feedCount: number;
  selectedCharacterId: string;
  learnedFoodIds: string[];
  claimedDailyRewardDate: string;
  soundEnabled: boolean;
};

const STORAGE_KEY = "rxv_eat_no_fat_layout_audit_fix_v1";

const characters: Character[] = [
  {
    id: "strawberry_bunny",
    name: "草莓星球兔",
    skill: "水果快樂值加成",
    favoriteCategory: "fruit",
    image: strawberryBunnyImg,
    theme: "pink",
  },
  {
    id: "boba_cat",
    name: "珍奶貓",
    skill: "每次餵食更容易冒愛心",
    favoriteCategory: "all",
    image: bobaCatImg,
    theme: "orange",
  },
  {
    id: "broccoli_sprite",
    name: "花椰菜小精靈",
    skill: "蔬菜快樂值加成",
    favoriteCategory: "vegetable",
    image: broccoliSpriteImg,
    theme: "green",
  },
  {
    id: "pudding_bear",
    name: "布丁小熊",
    skill: "點心快樂值加成",
    favoriteCategory: "snack",
    image: puddingBearImg,
    theme: "yellow",
  },
];

const foods: FoodItem[] = [
  { id: "apple", name: "蘋果", enName: "Apple", emoji: "🍎", point: 10, unlockPoint: 0, category: "fruit", colorName: "紅色", description: "蘋果是常見的紅色水果，香香甜甜很容易入口。" },
  { id: "banana", name: "香蕉", enName: "Banana", emoji: "🍌", point: 10, unlockPoint: 0, category: "fruit", colorName: "黃色", description: "香蕉是黃色水果，剝開皮就可以吃。" },
  { id: "carrot", name: "紅蘿蔔", enName: "Carrot", emoji: "🥕", point: 12, unlockPoint: 0, category: "vegetable", colorName: "橘色", description: "紅蘿蔔是橘色蔬菜，長長的樣子很可愛。" },
  { id: "broccoli", name: "花椰菜", enName: "Broccoli", emoji: "🥦", point: 14, unlockPoint: 80, category: "vegetable", colorName: "綠色", description: "花椰菜長得像一棵小樹，是常見的綠色蔬菜。" },
  { id: "strawberry", name: "草莓", enName: "Strawberry", emoji: "🍓", point: 16, unlockPoint: 160, category: "fruit", colorName: "紅色", description: "草莓紅紅小小，常出現在甜點和水果盤裡。" },
  { id: "corn", name: "玉米", enName: "Corn", emoji: "🌽", point: 18, unlockPoint: 260, category: "vegetable", colorName: "黃色", description: "玉米一粒一粒排得很整齊，咬起來甜甜的。" },
  { id: "watermelon", name: "西瓜", enName: "Watermelon", emoji: "🍉", point: 20, unlockPoint: 360, category: "fruit", colorName: "綠色外皮、紅色果肉", description: "西瓜很適合夏天吃，咬一口很清爽。" },
  { id: "tomato", name: "番茄", enName: "Tomato", emoji: "🍅", point: 20, unlockPoint: 520, category: "vegetable", colorName: "紅色", description: "番茄紅紅圓圓，可以煮湯，也可以做料理。" },
  { id: "egg_tart", name: "蛋塔", enName: "Egg Tart", emoji: "🥧", point: 26, unlockPoint: 720, category: "snack", colorName: "金黃色", description: "蛋塔是香香甜甜的點心，酥皮和內餡都很療癒。" },
  { id: "ice_cream", name: "冰淇淋", enName: "Ice Cream", emoji: "🍦", point: 30, unlockPoint: 980, category: "snack", colorName: "多種顏色", description: "冰淇淋冰冰甜甜，是幻想星球裡的人氣點心。" },
];

const categoryLabels: Record<FoodCategory | "all", string> = {
  all: "全部",
  fruit: "水果",
  vegetable: "蔬菜",
  snack: "點心",
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function initialState(): GameState {
  return {
    happyPoint: 0,
    feedCount: 0,
    selectedCharacterId: "boba_cat",
    learnedFoodIds: [],
    claimedDailyRewardDate: "",
    soundEnabled: true,
  };
}

function loadGameState(): GameState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    return {
      happyPoint: Number(parsed.happyPoint || 0),
      feedCount: Number(parsed.feedCount || 0),
      selectedCharacterId: String(parsed.selectedCharacterId || "boba_cat"),
      learnedFoodIds: Array.isArray(parsed.learnedFoodIds) ? parsed.learnedFoodIds : [],
      claimedDailyRewardDate: String(parsed.claimedDailyRewardDate || ""),
      soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : true,
    };
  } catch {
    return initialState();
  }
}

function playCuteSound(enabled: boolean, type: "feed" | "reward" | "select") {
  if (!enabled || typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const notes = type === "reward" ? [523.25, 659.25, 783.99] : type === "select" ? [392, 523.25] : [660, 880];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      gain.gain.setValueAtTime(0.0001, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.08, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.2);
    });

    window.setTimeout(() => ctx.close(), 700);
  } catch {
    // 音效為輔助，不影響遊戲
  }
}

function foodGradient(category: FoodCategory) {
  if (category === "fruit") return "linear-gradient(135deg, #fb477f, #f43f9e)";
  if (category === "vegetable") return "linear-gradient(135deg, #10b981, #22c55e)";
  return "linear-gradient(135deg, #f59e0b, #fb923c)";
}

function themeGradient(theme: Character["theme"]) {
  if (theme === "pink") return "linear-gradient(135deg, #fb5c93, #f43f5e)";
  if (theme === "orange") return "linear-gradient(135deg, #f59e0b, #fb923c)";
  if (theme === "green") return "linear-gradient(135deg, #10b981, #22c55e)";
  return "linear-gradient(135deg, #facc15, #f59e0b)";
}

export default function EatNoFatGame() {
  const [state, setState] = useState<GameState>(() => loadGameState());
  const [activeCategory, setActiveCategory] = useState<FoodCategory | "all">("all");
  const [lastFood, setLastFood] = useState<FoodItem | null>(null);
  const [reaction, setReaction] = useState("選一個角色，再點食物餵牠吃。");
  const [isEating, setIsEating] = useState(false);
  const [flyingFood, setFlyingFood] = useState<FoodItem | null>(null);
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const selectedCharacter = characters.find((item) => item.id === state.selectedCharacterId) || characters[1];
  const learnedFoodIds = useMemo(() => new Set(state.learnedFoodIds), [state.learnedFoodIds]);

  const visibleFoods = useMemo(() => {
    return foods.filter((food) => {
      if (state.happyPoint < food.unlockPoint) return false;
      if (activeCategory === "all") return true;
      return food.category === activeCategory;
    });
  }, [activeCategory, state.happyPoint]);

  const learnedFoods = foods.filter((food) => learnedFoodIds.has(food.id));
  const learnedFruitCount = learnedFoods.filter((food) => food.category === "fruit").length;
  const learnedVegetableCount = learnedFoods.filter((food) => food.category === "vegetable").length;
  const dailyTasks = [
    { label: "餵食 10 次", done: state.feedCount >= 10 },
    { label: "認識 1 種水果", done: learnedFruitCount >= 1 },
    { label: "認識 1 種蔬菜", done: learnedVegetableCount >= 1 },
  ];

  const allTasksDone = dailyTasks.every((task) => task.done);
  const rewardClaimed = state.claimedDailyRewardDate === todayKey();
  const nextUnlock = foods.find((food) => state.happyPoint < food.unlockPoint);

  function selectCharacter(id: string) {
    const character = characters.find((item) => item.id === id);
    setState((prev) => ({ ...prev, selectedCharacterId: id }));
    setReaction(character ? `${character.name}加入隊伍！` : "角色加入隊伍！");
    playCuteSound(state.soundEnabled, "select");
  }

  function feed(food: FoodItem) {
    const bonus = selectedCharacter.favoriteCategory === "all" || selectedCharacter.favoriteCategory === food.category ? 2 : 0;
    const point = food.point + bonus;

    setLastFood(food);
    setFlyingFood(food);
    setIsEating(true);
    setBurstKey((value) => value + 1);
    setReaction(`${food.name} ${food.enName}｜${food.colorName}・${categoryLabels[food.category]}`);
    playCuteSound(state.soundEnabled, "feed");

    window.setTimeout(() => setFlyingFood(null), 650);
    window.setTimeout(() => setIsEating(false), 1000);

    setState((prev) => ({
      ...prev,
      happyPoint: prev.happyPoint + point,
      feedCount: prev.feedCount + 1,
      learnedFoodIds: Array.from(new Set([...prev.learnedFoodIds, food.id])),
    }));
  }

  function claimDailyReward() {
    if (!allTasksDone || rewardClaimed) return;

    setBurstKey((value) => value + 1);
    setReaction("每日小任務完成！星星獎勵已加入。");
    playCuteSound(state.soundEnabled, "reward");

    setState((prev) => ({
      ...prev,
      happyPoint: prev.happyPoint + 120,
      claimedDailyRewardDate: todayKey(),
    }));
  }

  function resetGame() {
    const ok = window.confirm("確定要重新開始嗎？目前快樂值、圖鑑與任務進度會清除。");
    if (!ok) return;

    const fresh = initialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setState(fresh);
    setLastFood(null);
    setReaction("已重新開始，先從蘋果、香蕉和紅蘿蔔開始吧。");
  }

  return (
    <main className="rxv-eat-page">
      <style>{`
        .rxv-eat-page,
        .rxv-eat-page * {
          box-sizing: border-box;
          writing-mode: horizontal-tb !important;
          text-orientation: mixed !important;
        }

        .rxv-eat-page {
          min-height: 100vh;
          padding: 24px;
          background: linear-gradient(180deg, #fff1f2 0%, #fff7ed 52%, #eff6ff 100%);
          color: #1e293b;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .rxv-eat-wrap {
          width: min(1180px, 100%);
          margin: 0 auto;
          padding: 24px;
          border: 1px solid #ffe4e6;
          border-radius: 28px;
          background: rgba(255, 255, 255, .96);
          box-shadow: 0 18px 45px rgba(244, 63, 94, .12);
        }

        .rxv-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .rxv-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 30px;
          padding: 6px 12px;
          border-radius: 999px;
          background: #ffe4e6;
          color: #be123c;
          font-size: 13px;
          font-weight: 900;
        }

        .rxv-title {
          margin: 10px 0 8px;
          color: #e11d48;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.1;
          font-weight: 950;
          letter-spacing: .02em;
        }

        .rxv-desc {
          max-width: 760px;
          margin: 0;
          color: #475569;
          font-size: 16px;
          line-height: 1.75;
        }

        .rxv-sound-btn,
        .rxv-reset-btn {
          border: 0;
          cursor: pointer;
          white-space: nowrap;
          border-radius: 16px;
          font-weight: 900;
          color: #fff;
          box-shadow: 0 10px 20px rgba(15, 23, 42, .12);
        }

        .rxv-sound-btn {
          padding: 13px 20px;
          background: #334155;
          font-size: 16px;
        }

        .rxv-reset-btn {
          padding: 10px 16px;
          background: #64748b;
          font-size: 14px;
        }

        .rxv-character-area {
          margin-top: 18px;
          padding: 18px;
          border: 1px solid #ffe4e6;
          border-radius: 26px;
          background: linear-gradient(135deg, #fff1f2, #fff7ed);
        }

        .rxv-section-title {
          margin: 0;
          color: #e11d48;
          font-size: 24px;
          line-height: 1.25;
          font-weight: 950;
        }

        .rxv-character-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 14px;
        }

        .rxv-character-card {
          position: relative;
          min-width: 0;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          background: #fff;
          text-align: center;
          box-shadow: 0 6px 14px rgba(15, 23, 42, .06);
          transition: transform .18s ease, box-shadow .18s ease;
        }

        .rxv-character-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 22px rgba(15, 23, 42, .10);
        }

        .rxv-character-card.is-active {
          border-color: #fb7185;
          box-shadow: 0 0 0 4px #fb7185, 0 12px 22px rgba(244, 63, 94, .16);
        }

        .rxv-character-imgbox {
          position: relative;
          height: 150px;
          background: linear-gradient(180deg, #fff, #f8fafc);
        }

        .rxv-character-imgbox img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 10px;
        }

        .rxv-character-label {
          position: absolute;
          right: 10px;
          top: 10px;
          padding: 5px 10px;
          border-radius: 999px;
          color: #fff;
          font-size: 12px;
          font-weight: 900;
        }

        .rxv-character-body {
          padding: 12px;
        }

        .rxv-character-name {
          margin: 0;
          font-size: 16px;
          line-height: 1.5;
          font-weight: 950;
          color: #0f172a;
        }

        .rxv-character-skill {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
          margin-top: 8px;
          padding: 8px 10px;
          border-radius: 14px;
          background: #f8fafc;
          color: #be123c;
          font-size: 13px;
          line-height: 1.45;
          font-weight: 850;
        }

        .rxv-learn-bar {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 18px;
          padding: 16px;
          border: 1px solid #bbf7d0;
          border-radius: 22px;
          background: #ecfdf5;
        }

        .rxv-learn-emoji {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          width: 58px;
          height: 58px;
          border-radius: 18px;
          background: #fff;
          font-size: 36px;
          box-shadow: 0 6px 14px rgba(15, 23, 42, .08);
        }

        .rxv-learn-info {
          min-width: 0;
          flex: 1 1 auto;
        }

        .rxv-tiny-label {
          margin: 0 0 4px;
          color: #047857;
          font-size: 12px;
          line-height: 1.4;
          font-weight: 950;
        }

        .rxv-food-main-line {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 6px 10px;
          margin: 0;
          font-size: 20px;
          line-height: 1.55;
          font-weight: 950;
          color: #0f172a;
        }

        .rxv-food-en {
          color: #047857;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .rxv-food-meta {
          color: #64748b;
          font-size: 14px;
          font-weight: 850;
        }

        .rxv-food-desc {
          margin: 6px 0 0;
          color: #334155;
          font-size: 15px;
          line-height: 1.75;
          font-weight: 750;
        }

        .rxv-game-grid {
          display: grid;
          grid-template-columns: minmax(330px, 1fr) minmax(300px, 340px) minmax(320px, 360px);
          gap: 16px;
          align-items: start;
          margin-top: 18px;
        }

        .rxv-card {
          min-width: 0;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          background: #fff;
          padding: 18px;
          box-shadow: 0 8px 18px rgba(15, 23, 42, .05);
        }

        .rxv-card-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .rxv-card-title {
          margin: 0;
          color: #0f172a;
          font-size: 24px;
          line-height: 1.25;
          font-weight: 950;
        }

        .rxv-next {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 850;
          text-align: right;
        }

        .rxv-filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 12px 0 18px;
        }

        .rxv-filter-btn {
          min-height: 44px;
          padding: 8px 16px;
          border: 0;
          border-radius: 999px;
          background: #f1f5f9;
          color: #0f172a;
          cursor: pointer;
          font-size: 16px;
          line-height: 1.2;
          font-weight: 900;
        }

        .rxv-filter-btn.is-active {
          background: #f43f5e;
          color: #fff;
          box-shadow: 0 10px 16px rgba(244, 63, 94, .22);
        }

        .rxv-food-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
          gap: 12px;
        }

        .rxv-food-btn {
          min-width: 0;
          min-height: 116px;
          padding: 14px 10px;
          border: 0;
          border-radius: 20px;
          color: #fff;
          cursor: pointer;
          text-align: center;
          box-shadow: 0 8px 16px rgba(15, 23, 42, .10);
          transition: transform .16s ease, box-shadow .16s ease;
        }

        .rxv-food-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 24px rgba(15, 23, 42, .15);
        }

        .rxv-food-emoji {
          font-size: 34px;
          line-height: 1;
        }

        .rxv-food-name {
          margin-top: 8px;
          font-size: 16px;
          line-height: 1.35;
          font-weight: 950;
        }

        .rxv-food-point {
          margin-top: 4px;
          font-size: 12px;
          line-height: 1.35;
          font-weight: 850;
          opacity: .96;
        }

        .rxv-status-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .rxv-status {
          padding: 12px 8px;
          border-radius: 18px;
          text-align: center;
        }

        .rxv-status small {
          display: block;
          font-size: 12px;
          line-height: 1.4;
          font-weight: 950;
        }

        .rxv-status strong {
          display: block;
          margin-top: 4px;
          font-size: 24px;
          line-height: 1.2;
          font-weight: 950;
        }

        .rxv-character-stage {
          position: relative;
          overflow: hidden;
          border: 1px solid #ffe4e6;
          border-radius: 24px;
          background: linear-gradient(180deg, #fff, #fff1f2);
          padding: 16px;
          text-align: center;
        }

        .rxv-stage-name {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 34px;
          padding: 7px 16px;
          border-radius: 999px;
          color: #fff;
          font-size: 14px;
          font-weight: 950;
          box-shadow: 0 8px 14px rgba(244, 63, 94, .15);
        }

        .rxv-character-frame {
          position: relative;
          height: 255px;
          margin-top: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          background: #fff;
          box-shadow: inset 0 0 28px rgba(244, 63, 94, .07);
        }

        .rxv-character-frame img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 12px;
        }

        .rxv-reaction {
          margin-top: 12px;
          padding: 12px 14px;
          border: 1px solid #fed7aa;
          border-radius: 18px;
          background: #fff7ed;
          color: #c2410c;
          font-size: 14px;
          line-height: 1.65;
          font-weight: 950;
        }

        .rxv-flying-food {
          position: absolute;
          left: 50%;
          top: 42%;
          z-index: 5;
          pointer-events: none;
          font-size: 48px;
          animation: rxvFlyFood .65s cubic-bezier(.2,.8,.2,1) forwards;
        }

        .rxv-eating {
          animation: rxvEat .55s ease-in-out infinite;
        }

        .rxv-float {
          position: absolute;
          z-index: 6;
          pointer-events: none;
          animation: rxvFloatUp 1.12s ease-out forwards;
        }

        .rxv-eating-food {
          position: absolute;
          right: 16px;
          bottom: 18px;
          z-index: 5;
          border-radius: 999px;
          background: #fff;
          padding: 8px 14px;
          font-size: 30px;
          box-shadow: 0 10px 18px rgba(15, 23, 42, .14);
        }

        .rxv-info-panel {
          display: grid;
          gap: 14px;
        }

        .rxv-info-card {
          border: 1px solid #fed7aa;
          border-radius: 24px;
          background: #fff7ed;
          padding: 18px;
        }

        .rxv-info-title {
          margin: 0;
          color: #c2410c;
          font-size: 24px;
          line-height: 1.3;
          font-weight: 950;
        }

        .rxv-food-mini {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 14px;
        }

        .rxv-food-mini-emoji {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: #fff;
          font-size: 38px;
          box-shadow: 0 6px 14px rgba(15, 23, 42, .08);
        }

        .rxv-category-tag {
          display: inline-flex;
          margin-top: 12px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          line-height: 1.3;
          font-weight: 950;
        }

        .rxv-task-card {
          border: 1px solid #fde68a;
          border-radius: 24px;
          background: #fffbeb;
          padding: 18px;
        }

        .rxv-task-title {
          margin: 0;
          color: #c2410c;
          font-size: 24px;
          line-height: 1.3;
          font-weight: 950;
        }

        .rxv-task-list {
          display: grid;
          gap: 10px;
          margin-top: 14px;
        }

        .rxv-task-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          min-height: 52px;
          padding: 12px 14px;
          border-radius: 16px;
          background: #fff;
          color: #475569;
          font-size: 14px;
          font-weight: 900;
        }

        .rxv-task-row.is-done {
          background: #bbf7d0;
          color: #047857;
        }

        .rxv-reward-btn {
          width: 100%;
          margin-top: 12px;
          min-height: 48px;
          border: 0;
          border-radius: 18px;
          background: linear-gradient(135deg, #fbbf24, #fb7185);
          color: #fff;
          cursor: pointer;
          font-size: 16px;
          font-weight: 950;
          box-shadow: 0 10px 18px rgba(251, 113, 133, .2);
        }

        .rxv-reward-btn:disabled {
          cursor: not-allowed;
          opacity: .55;
        }

        .rxv-collection-card {
          margin-top: 18px;
          border: 1px solid #bae6fd;
          border-radius: 24px;
          background: #fff;
          padding: 18px;
          box-shadow: 0 8px 18px rgba(15, 23, 42, .05);
        }

        .rxv-collection-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .rxv-collection-title {
          margin: 0;
          color: #0369a1;
          font-size: 24px;
          line-height: 1.3;
          font-weight: 950;
        }

        .rxv-collection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(94px, 1fr));
          gap: 10px;
        }

        .rxv-collection-item {
          min-height: 104px;
          padding: 12px 8px;
          border-radius: 18px;
          background: #f1f5f9;
          color: #94a3b8;
          text-align: center;
        }

        .rxv-collection-item.is-open {
          background: #f8fafc;
          color: #334155;
          border: 1px solid #e2e8f0;
        }

        .rxv-collection-item.is-learned {
          background: #e0f2fe;
          color: #0f172a;
        }

        .rxv-collection-emoji {
          font-size: 27px;
          line-height: 1;
        }

        .rxv-collection-name {
          margin-top: 7px;
          font-size: 14px;
          line-height: 1.35;
          font-weight: 950;
        }

        .rxv-collection-note {
          margin-top: 4px;
          font-size: 12px;
          line-height: 1.35;
          font-weight: 850;
        }

        .rxv-disclaimer {
          margin: 18px 0 0;
          padding: 12px 16px;
          border-radius: 18px;
          background: #f1f5f9;
          color: #475569;
          font-size: 14px;
          line-height: 1.8;
          font-weight: 700;
        }

        @keyframes rxvEat {
          0%, 100% { transform: translateY(0) scale(1); }
          35% { transform: translateY(-7px) scale(1.035); }
          70% { transform: translateY(3px) scale(.99); }
        }

        @keyframes rxvFlyFood {
          0% { transform: translate(-115px, 70px) scale(.72) rotate(-8deg); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translate(0, 0) scale(1.22) rotate(10deg); opacity: 0; }
        }

        @keyframes rxvFloatUp {
          0% { transform: translateY(22px) scale(.75); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translateY(-78px) scale(1.15); opacity: 0; }
        }

        @media (max-width: 1180px) {
          .rxv-game-grid {
            grid-template-columns: minmax(280px, 1fr) minmax(300px, 360px);
          }

          .rxv-info-panel {
            grid-column: 1 / -1;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .rxv-character-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .rxv-eat-page {
            padding: 12px;
          }

          .rxv-eat-wrap {
            padding: 16px;
            border-radius: 22px;
          }

          .rxv-header {
            align-items: stretch;
            flex-direction: column;
          }

          .rxv-sound-btn {
            width: 100%;
          }

          .rxv-character-grid,
          .rxv-game-grid,
          .rxv-info-panel {
            grid-template-columns: 1fr;
          }

          .rxv-learn-bar {
            align-items: flex-start;
          }

          .rxv-food-main-line {
            font-size: 18px;
          }

          .rxv-card-title-row,
          .rxv-collection-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .rxv-next {
            text-align: left;
          }

          .rxv-character-frame {
            height: 230px;
          }

          .rxv-food-mini {
            align-items: flex-start;
          }
        }
      `}</style>

      <section className="rxv-eat-wrap">
        <header className="rxv-header">
          <div>
            <span className="rxv-pill">蔬果療癒小遊戲</span>
            <h1 className="rxv-title">吃不胖星球</h1>
            <p className="rxv-desc">
              選角色、餵食物、認識蔬果。這版重新檢查整體排版，避免文字被擠到邊界或變成一字一行。
            </p>
          </div>
          <button
            type="button"
            className="rxv-sound-btn"
            onClick={() => setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
          >
            {state.soundEnabled ? "音效：開" : "音效：關"}
          </button>
        </header>

        <section className="rxv-character-area">
          <h2 className="rxv-section-title">選擇美食夥伴</h2>
          <div className="rxv-character-grid">
            {characters.map((character) => {
              const selected = character.id === selectedCharacter.id;

              return (
                <button
                  key={character.id}
                  type="button"
                  className={`rxv-character-card ${selected ? "is-active" : ""}`}
                  onClick={() => selectCharacter(character.id)}
                >
                  <div className="rxv-character-imgbox">
                    <img src={character.image} alt={character.name} />
                    <span className="rxv-character-label" style={{ background: themeGradient(character.theme) }}>
                      可選
                    </span>
                  </div>
                  <div className="rxv-character-body">
                    <p className="rxv-character-name">{character.name}</p>
                    <p className="rxv-character-skill">{character.skill}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {lastFood && (
          <section className="rxv-learn-bar">
            <div className="rxv-learn-emoji">{lastFood.emoji}</div>
            <div className="rxv-learn-info">
              <p className="rxv-tiny-label">剛剛認識</p>
              <p className="rxv-food-main-line">
                <span>{lastFood.name}</span>
                <span className="rxv-food-en">{lastFood.enName}</span>
                <span className="rxv-food-meta">{lastFood.colorName}・{categoryLabels[lastFood.category]}</span>
              </p>
              <p className="rxv-food-desc">{lastFood.description}</p>
            </div>
          </section>
        )}

        <section className="rxv-game-grid">
          <section className="rxv-card">
            <div className="rxv-card-title-row">
              <h2 className="rxv-card-title">選食物餵角色</h2>
              {nextUnlock ? (
                <p className="rxv-next">
                  下一個：{nextUnlock.emoji} {nextUnlock.name}，差 {nextUnlock.unlockPoint - state.happyPoint}
                </p>
              ) : (
                <p className="rxv-next">全部解鎖</p>
              )}
            </div>

            <div className="rxv-filter-row">
              {(["all", "fruit", "vegetable", "snack"] as const).map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`rxv-filter-btn ${activeCategory === category ? "is-active" : ""}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>

            <div className="rxv-food-grid">
              {visibleFoods.map((food) => {
                const bonus = selectedCharacter.favoriteCategory === "all" || selectedCharacter.favoriteCategory === food.category ? 2 : 0;

                return (
                  <button
                    key={food.id}
                    type="button"
                    className="rxv-food-btn"
                    style={{ background: foodGradient(food.category) }}
                    onClick={() => feed(food)}
                  >
                    <div className="rxv-food-emoji">{food.emoji}</div>
                    <div className="rxv-food-name">{food.name}</div>
                    <div className="rxv-food-point">+{food.point + bonus} 快樂值</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rxv-card">
            <div className="rxv-status-grid">
              <div className="rxv-status" style={{ background: "#fef3c7", color: "#92400e" }}>
                <small>快樂值</small>
                <strong>{state.happyPoint}</strong>
              </div>
              <div className="rxv-status" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                <small>餵食</small>
                <strong>{state.feedCount}</strong>
              </div>
              <div className="rxv-status" style={{ background: "#bbf7d0", color: "#047857" }}>
                <small>圖鑑</small>
                <strong>{learnedFoodIds.size}</strong>
              </div>
            </div>

            <div className="rxv-character-stage">
              {flyingFood && <div className="rxv-flying-food">{flyingFood.emoji}</div>}

              <div key={burstKey}>
                <span className="rxv-float" style={{ left: "24%", top: "62%", fontSize: "24px" }}>💖</span>
                <span className="rxv-float" style={{ left: "48%", top: "56%", fontSize: "24px", animationDelay: ".12s" }}>✨</span>
                <span className="rxv-float" style={{ left: "69%", top: "64%", fontSize: "24px", animationDelay: ".2s" }}>🌟</span>
              </div>

              <div className="rxv-stage-name" style={{ background: themeGradient(selectedCharacter.theme) }}>
                {selectedCharacter.name}
              </div>

              <div className={`rxv-character-frame ${isEating ? "rxv-eating" : ""}`}>
                <img src={selectedCharacter.image} alt={selectedCharacter.name} />
                {isEating && lastFood && <div className="rxv-eating-food">{lastFood.emoji}</div>}
              </div>

              <div className="rxv-reaction">{reaction}</div>
            </div>
          </section>

          <section className="rxv-info-panel">
            <div className="rxv-info-card">
              <h3 className="rxv-info-title">今天認識的食物</h3>
              {lastFood ? (
                <>
                  <div className="rxv-food-mini">
                    <div className="rxv-food-mini-emoji">{lastFood.emoji}</div>
                    <div>
                      <p className="rxv-food-main-line">
                        <span>{lastFood.name}</span>
                        <span className="rxv-food-en">{lastFood.enName}</span>
                      </p>
                    </div>
                  </div>
                  <span className="rxv-category-tag" style={categoryPillStyle(lastFood.category)}>
                    {categoryLabels[lastFood.category]}・{lastFood.colorName}
                  </span>
                  <p className="rxv-food-desc">{lastFood.description}</p>
                </>
              ) : (
                <p className="rxv-food-desc">點食物後，這裡會顯示名稱、英文、顏色與介紹。</p>
              )}
            </div>

            <div className="rxv-task-card">
              <h3 className="rxv-task-title">每日小任務</h3>
              <div className="rxv-task-list">
                {dailyTasks.map((task) => (
                  <div key={task.label} className={`rxv-task-row ${task.done ? "is-done" : ""}`}>
                    <span>{task.label}</span>
                    <span>{task.done ? "完成" : "未完成"}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="rxv-reward-btn"
                disabled={!allTasksDone || rewardClaimed}
                onClick={claimDailyReward}
              >
                {rewardClaimed ? "今天已領取" : "領取獎勵 +120"}
              </button>
            </div>
          </section>
        </section>

        <section className="rxv-collection-card">
          <div className="rxv-collection-header">
            <h2 className="rxv-collection-title">食物圖鑑</h2>
            <button type="button" className="rxv-reset-btn" onClick={resetGame}>
              重新開始
            </button>
          </div>

          <div className="rxv-collection-grid">
            {foods.map((food) => {
              const unlocked = state.happyPoint >= food.unlockPoint;
              const learned = learnedFoodIds.has(food.id);

              return (
                <div
                  key={food.id}
                  className={`rxv-collection-item ${unlocked ? "is-open" : ""} ${learned ? "is-learned" : ""}`}
                >
                  <div className="rxv-collection-emoji">{unlocked ? food.emoji : "🔒"}</div>
                  <div className="rxv-collection-name">{food.name}</div>
                  <div className="rxv-collection-note">
                    {learned ? "已認識" : unlocked ? "可餵食" : `${food.unlockPoint}`}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <p className="rxv-disclaimer">
          本遊戲為幻想系療癒小遊戲，內容不代表真實飲食或健康建議。現實生活仍建議均衡飲食與適度運動。
        </p>
      </section>
    </main>
  );
}

function categoryPillStyle(category: FoodCategory): React.CSSProperties {
  if (category === "fruit") return { background: "#ffe4e6", color: "#be123c" };
  if (category === "vegetable") return { background: "#dcfce7", color: "#047857" };
  return { background: "#fef3c7", color: "#92400e" };
}
