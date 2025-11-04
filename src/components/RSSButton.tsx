// src/components/RSSButton.tsx
import { Rss } from "lucide-react";

export default function RSSButton() {
  return (
    <a
      href="/rss.xml"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-600 font-medium rounded-xl px-4 py-2 shadow-sm transition-all duration-200"
    >
      <Rss className="w-5 h-5" />
      <span>訂閱 RSS</span>
    </a>
  );
}

