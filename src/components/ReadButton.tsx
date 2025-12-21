import { useState } from "react";
import { googleSpeak, stopSpeak } from "@/services/voiceService";
import { IoVolumeHighOutline, IoStopOutline } from "react-icons/io5";

interface ReadButtonProps {
  text: string;
  lang: string;
}

export default function ReadButton({ text, lang }: ReadButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSpeak = () => {
    if (!isPlaying) {
      setIsPlaying(true);

      googleSpeak({
        text,
        lang,
        voiceType: "female",
        onProgress: (r) => setProgress(r),
        onEnd: () => {
          setIsPlaying(false);
          setProgress(0);
        },
      });
    } else {
      stopSpeak();
      setIsPlaying(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      {/* 播放 / 停止按鈕 */}
      <button
        onClick={handleSpeak}
        className="p-2 rounded-full shadow-md bg-white hover:scale-110 transition text-gray-700"
        title={isPlaying ? "停止朗讀" : "語音朗讀"}
      >
        {isPlaying ? (
          <IoStopOutline className="text-2xl text-red-500" />
        ) : (
          <IoVolumeHighOutline className="text-2xl" />
        )}
      </button>

      {/* 播放進度條 */}
      {isPlaying && (
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all"
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
















