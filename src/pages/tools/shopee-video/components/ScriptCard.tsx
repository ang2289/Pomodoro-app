// src/pages/tools/shopee-video/components/ScriptCard.tsx

interface ScriptCardProps {
  script: string;
  onChange: (script: string) => void;
}

export default function ScriptCard({ script, onChange }: ScriptCardProps) {
  if (!script) return null;

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">
        影片腳本
      </label>
      <textarea
        value={script}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
        style={{
          fontSize: "16px",
          minHeight: "120px",
          padding: "12px 16px",
          borderRadius: "12px",
          border: "1px solid #d1d5db",
          boxSizing: "border-box",
        }}
        placeholder="腳本內容..."
      />
    </div>
  );
}

