import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { backupDataToFile, restoreDataFromFile } from '../utils/backupUtils';
export default function BackupSettings() {
    const fileInputRef = useRef(null);
    const handleRestore = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        try {
            await restoreDataFromFile(file);
            alert('✅ 資料還原成功！');
            window.location.reload();
        }
        catch (err) {
            alert('❌ 匯入失敗，請確認檔案格式正確');
        }
    };
    return (_jsxs("div", { className: "border-t pt-4 mt-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-3", children: "\uD83D\uDCE6 \u8CC7\u6599\u5099\u4EFD\u8207\u9084\u539F" }), _jsxs("div", { className: "flex flex-col space-y-3", children: [_jsx("div", { className: "flex justify-center", children: _jsx("button", { onClick: backupDataToFile, className: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition !w-1/3", children: "\u532F\u51FA\u5099\u4EFD\uFF08.json\uFF09" }) }), _jsx("div", { className: "flex justify-center", children: _jsx("button", { onClick: () => fileInputRef.current?.click(), className: "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition !w-1/3", children: "\u532F\u5165\u9084\u539F\uFF08.json\uFF09" }) }), _jsx("input", { ref: fileInputRef, type: "file", accept: "application/json", onChange: handleRestore, className: "hidden" })] })] }));
}
