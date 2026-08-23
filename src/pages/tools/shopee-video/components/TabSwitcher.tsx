// src/pages/tools/shopee-video/components/TabSwitcher.tsx

interface TabSwitcherProps {
  currentMode: "single" | "batch";
  onChange: (mode: "single" | "batch") => void;
}

export default function TabSwitcher({ currentMode, onChange }: TabSwitcherProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 mb-10">
      <div className="flex gap-3">
        <button
          onClick={() => onChange("single")}
          className={`flex-1 h-[52px] rounded-xl font-semibold transition-all ${
            currentMode === "single"
              ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          單支模式
        </button>
        <button
          onClick={() => onChange("batch")}
          className={`flex-1 h-[52px] rounded-xl font-semibold transition-all ${
            currentMode === "batch"
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

