// src/utils/backupUtils.ts
import { saveAs } from 'file-saver';

export function backupDataToFile() {
    try {
        console.log('開始匯出備份資料...');
        
        // 收集所有 localStorage 資料
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const value = localStorage.getItem(key);
                if (value !== null) {
                    allData[key] = value;
                }
            }
        }
        
        console.log('收集到的資料鍵值:', Object.keys(allData));
        console.log('資料總數:', Object.keys(allData).length);
        
        // 添加備份元資料
        const backupData = {
            backupInfo: {
                timestamp: new Date().toISOString(),
                version: '1.0',
                deviceType: /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                userAgent: navigator.userAgent
            },
            data: allData
        };
        
        const jsonString = JSON.stringify(backupData, null, 2);
        console.log('備份資料大小:', jsonString.length, '字元');
        
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
        const fileName = `pomodoro_backup_${new Date().toISOString().slice(0, 10)}_${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}.json`;
        
        console.log('準備下載檔案:', fileName);
        
        // 使用 file-saver 下載檔案，提升手機支援度
        saveAs(blob, fileName);
        
        console.log('檔案下載請求已發送');
        
        // 顯示成功訊息
        setTimeout(() => {
            alert('✅ 備份檔案已開始下載！\n\n檔案名稱：' + fileName + '\n存儲位置：瀏覽器下載資料夾\n\n檔案已下載到您的預設下載資料夾中。');
        }, 500);
        
    } catch (error) {
        console.error('匯出備份時發生錯誤:', error);
        alert('❌ 匯出備份失敗：' + error.message);
        
        // 備用方案：使用原生下載方法
        try {
            console.log('嘗試備用下載方案...');
            const allData = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    allData[key] = localStorage.getItem(key) || '';
                }
            }
            
            const jsonString = JSON.stringify(allData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            alert('✅ 備份檔案已下載（使用備用方案）\n\n檔案名稱：' + link.download + '\n存儲位置：瀏覽器下載資料夾\n\n檔案已下載到您的預設下載資料夾中。');
        } catch (fallbackError) {
            console.error('備用下載方案也失敗:', fallbackError);
            alert('❌ 所有下載方案都失敗，請檢查瀏覽器設定');
        }
    }
}
export function restoreDataFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                console.log('開始還原備份資料...');
                const fileContent = reader.result;
                console.log('檔案內容長度:', fileContent.length);
                
                const parsedData = JSON.parse(fileContent);
                console.log('解析後的資料結構:', Object.keys(parsedData));
                
                let dataToRestore;
                
                // 檢查是否是新格式（包含 backupInfo）
                if (parsedData.backupInfo && parsedData.data) {
                    console.log('檢測到新格式備份檔案');
                    console.log('備份時間:', parsedData.backupInfo.timestamp);
                    console.log('備份版本:', parsedData.backupInfo.version);
                    console.log('裝置類型:', parsedData.backupInfo.deviceType);
                    dataToRestore = parsedData.data;
                } else {
                    console.log('檢測到舊格式備份檔案');
                    dataToRestore = parsedData;
                }
                
                console.log('要還原的資料鍵值:', Object.keys(dataToRestore));
                console.log('資料總數:', Object.keys(dataToRestore).length);
                
                // 備份現有資料（以防萬一）
                const currentBackup = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key) {
                        currentBackup[key] = localStorage.getItem(key);
                    }
                }
                
                // 儲存當前備份到臨時變數（僅在記憶體中）
                console.log('已備份當前資料，鍵值數量:', Object.keys(currentBackup).length);
                
                // 清除現有資料
                localStorage.clear();
                console.log('已清除現有 localStorage');
                
                // 還原資料
                let restoredCount = 0;
                for (const [key, value] of Object.entries(dataToRestore)) {
                    try {
                        localStorage.setItem(key, value);
                        restoredCount++;
                    } catch (storageError) {
                        console.error('儲存鍵值失敗:', key, storageError);
                    }
                }
                
                console.log('成功還原資料數量:', restoredCount);
                resolve();
            }
            catch (error) {
                console.error('還原資料時發生錯誤:', error);
                reject(error);
            }
        };
        reader.onerror = (error) => {
            console.error('讀取檔案時發生錯誤:', error);
            reject(error);
        };
        reader.readAsText(file);
    });
}
