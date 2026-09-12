#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 開始自動備份...');

try {
  // 檢查是否有變更
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (!status.trim()) {
    console.log('✅ 沒有變更需要備份');
    return;
  }

  // 添加所有變更
  execSync('git add .', { stdio: 'inherit' });
  
  // 建立提交訊息
  const timestamp = new Date().toLocaleString('zh-TW');
  const commitMessage = `自動備份: ${timestamp}`;
  
  // 提交變更
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  
  // 推送到遠端
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('✅ 自動備份完成！');
  
} catch (error) {
  console.error('❌ 自動備份失敗:', error.message);
  process.exit(1);
}
