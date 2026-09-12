let isSpeaking = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function toggleSpeak(text: string, lang = "zh-TW") {
  // 若正在播放 → 停止
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    return;
  }

  // 若沒有播放 → 開始播放
  if (!window.speechSynthesis) {
    // console.warn("speech synthesis not supported");
    return;
  }

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = lang;
  currentUtterance.rate = 1;
  currentUtterance.pitch = 1;

  // 播放開始
  currentUtterance.onstart = () => {
    isSpeaking = true;
  };

  // 播放結束（包含按停止）
  currentUtterance.onend = () => {
    isSpeaking = false;
  };

  window.speechSynthesis.speak(currentUtterance);
}
