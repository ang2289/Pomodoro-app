@echo off
echo 🚀 開始清理並打包 APK...

cd android

:: 檢查 gradlew.bat 是否存在
if not exist gradlew.bat (
    echo ❌ 找不到 gradlew.bat，請確認是否已執行 gradle wrapper
    pause
    exit /b
)

:: 執行清理
call gradlew.bat clean

:: 執行打包
call gradlew.bat assembleDebug

:: 檢查 APK 是否成功產出
set APK_PATH=app\build\outputs\apk\debug\app-debug.apk

if exist %APK_PATH% (
    echo ✅ APK 已產生：%APK_PATH%
    start "" "%APK_PATH%"
) else (
    echo ❌ APK 產生失敗，請檢查錯誤訊息。
)

pause

