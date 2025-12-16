// src/components/UpgradePopup.tsx
interface UpgradePopupProps {
  onClose: () => void;
}

export function UpgradePopup({ onClose }: UpgradePopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-80">
        <h2 className="text-xl font-bold mb-2">升級 VIP 方案</h2>
        <p className="text-sm text-gray-600 mb-4">
          你今天的免費額度已使用完畢。升級後可解除所有限制！
        </p>

        <ul className="text-sm mb-4 space-y-1">
          <li>✓ 摘要無限次</li>
          {/* 作業助手功能已暫時隱藏 */}
          {/* <li>✓ 作業助手無限次</li> */}
          <li>✓ 更快速度</li>
        </ul>

        <button className="bg-blue-500 text-white w-full py-2 rounded-lg mb-2">
          升級 NT$149 / 月
        </button>

        <button onClick={onClose} className="text-gray-500 text-sm w-full">
          先不用
        </button>
      </div>
    </div>
  );
}




