#!/bin/bash
echo "🚀 開始清理並打包 APK..."

cd android || exit
./gradlew clean
./gradlew assembleDebug

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  echo "✅ APK 已產生：$APK_PATH"
else
  echo "❌ APK 產生失敗，請檢查錯誤訊息。"
fi
