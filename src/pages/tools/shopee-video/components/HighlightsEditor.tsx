// src/pages/tools/shopee-video/components/HighlightsEditor.tsx

interface HighlightsEditorProps {
  highlights: string[];
  onChange: (newHighlights: string[]) => void;
}

export default function HighlightsEditor({ highlights, onChange }: HighlightsEditorProps) {
  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    onChange(newHighlights);
  };

  const removeHighlight = (index: number) => {
    if (highlights.length <= 1) return;
    const newHighlights = highlights.filter((_, i) => i !== index);
    onChange(newHighlights);
  };

  const addHighlight = () => {
    if (highlights.length >= 3) return;
    onChange([...highlights, ""]);
  };

  return (
    <div className="space-y-4">
      {highlights.map((highlight, index) => (
        <div key={index} className="flex items-center gap-3">
          <input
            type="text"
            value={highlight}
            onChange={(e) => updateHighlight(index, e.target.value)}
            className="flex-1 bg-white rounded-xl border border-gray-300 px-4 h-[52px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
            style={{
              fontSize: "16px",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              boxSizing: "border-box",
            }}
            placeholder={`賣點 ${index + 1}`}
          />
          {highlights.length > 1 && (
            <button
              onClick={() => removeHighlight(index)}
              className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 transition-all flex items-center justify-center font-bold text-lg flex-shrink-0"
              title="移除"
            >
              ×
            </button>
          )}
        </div>
      ))}
      {highlights.length < 3 && (
        <button
          onClick={addHighlight}
          className="w-full px-4 py-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all font-medium text-base border border-blue-200"
        >
          + 新增賣點
        </button>
      )}
    </div>
  );
}

