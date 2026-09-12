// src/pages/tools/shopee-video/components/ModeSwitcher.tsx

interface ModeSwitcherProps {
  mode: "single" | "batch";
  onModeChange: (mode: "single" | "batch") => void;
}

export default function ModeSwitcher({ mode, onModeChange }: ModeSwitcherProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 mb-10">
      <div className="flex gap-3">
        <button
          onClick={() => onModeChange("single")}
          className={`flex-1 h-[52px] rounded-xl font-semibold transition-all ${
            mode === "single"
              ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          單一模式
        </button>
        <button
          onClick={() => onModeChange("batch")}
          className={`flex-1 h-[52px] rounded-xl font-semibold transition-all ${
            mode === "batch"
              ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          批次模式
        </button>
      </div>
    </div>
  );
}

