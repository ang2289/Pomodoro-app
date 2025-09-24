# build-apk.ps1
# 自動建立 keystore、清理、編譯、簽署並輸出 APK

Write-Host " 開始打包 APK ..."

# === 基本參數 ===
$keystorePath = "C:\Pomodoro-app\my-release-key.jks"
$keystoreAlias = "my-key-alias"
$keystorePass = "123456"
$androidPath = "C:\Pomodoro-app\android"
$jdkPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot\bin"
$zipalignPath = "$env:LOCALAPPDATA\Android\Sdk\build-tools\34.0.0\zipalign.exe"

# === Step 1: 建立 keystore ===
if (-Not (Test-Path $keystorePath)) {
    Write-Host " 未找到 keystore，正在建立..."
    & "$jdkPath\keytool.exe" -genkey -v -keystore $keystorePath -alias $keystoreAlias -keyalg RSA -keysize 2048 -validity 10000 -storepass $keystorePass -keypass $keystorePass -dname "CN=Pomodoro,O=RxV,L=Taipei,ST=Taiwan,C=TW"
    Write-Host " Keystore 已建立：$keystorePath"
} else {
    Write-Host "ℹ 已存在 keystore，略過建立。"
}

# === Step 2: 清理並編譯 ===
Set-Location $androidPath
Write-Host " 清理專案 ..."
./gradlew clean

Write-Host " 建立 Debug 與 Release APK ..."
./gradlew assembleDebug
./gradlew assembleRelease

# === Step 3: 簽署 APK ===
$unsignedApk = "app\build\outputs\apk\release\app-release-unsigned.apk"
$finalApk = "app\build\outputs\apk\release\app-release-final.apk"

if (Test-Path $unsignedApk) {
    Write-Host " 簽署 APK ..."
    & "$jdkPath\jarsigner.exe" -verbose -keystore $keystorePath -storepass $keystorePass -keypass $keystorePass $unsignedApk $keystoreAlias

    if (Test-Path $zipalignPath) {
        Write-Host " 使用 zipalign 對齊 APK ..."
        & $zipalignPath -v 4 $unsignedApk $finalApk
        Write-Host " 已簽署 APK：$finalApk"
    } else {
        Write-Host " 找不到 zipalign，請確認 Android build-tools 是否安裝"
    }
} else {
    Write-Host " 找不到未簽名的 Release APK，請確認 assembleRelease 是否成功"
}

# === Step 4: 結果提示 ===
$debugApk = "app\build\outputs\apk\debug\app-debug.apk"
Write-Host " Debug APK:   $androidPath\$debugApk"
Write-Host " Release APK: $androidPath\$finalApk"
