import React, { useState, useEffect } from 'react';

interface TimeRangePickerProps {
  className?: string;
  onChange?: (range: { start: string; end: string }) => void;
  defaultStart?: string;
  defaultEnd?: string;
  label?: string;
}

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  className = '',
  onChange,
  defaultStart,
  defaultEnd,
  label = '時間範圍'
}) => {
  // 格式化當前時間為 HTML5 datetime-local 格式
  const formatDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 初始化狀態
  const [startTime, setStartTime] = useState<string>(() => {
    if (defaultStart) return defaultStart;
    return formatDateTime(new Date());
  });

  const [endTime, setEndTime] = useState<string>(() => {
    if (defaultEnd) return defaultEnd;
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + 1); // 預設結束時間為開始時間後1小時
    return formatDateTime(endDate);
  });

  // 當時間改變時，通知父組件
  useEffect(() => {
    if (onChange) {
      onChange({ start: startTime, end: endTime });
    }
  }, [startTime, endTime, onChange]);

  // 處理開始時間變更
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);

    // 如果結束時間早於開始時間，自動調整結束時間
    if (newStartTime && endTime && newStartTime >= endTime) {
      const startDate = new Date(newStartTime);
      startDate.setHours(startDate.getHours() + 1);
      setEndTime(formatDateTime(startDate));
    }
  };

  // 處理結束時間變更
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);

    // 如果結束時間早於開始時間，自動調整開始時間
    if (startTime && newEndTime && newEndTime <= startTime) {
      const endDate = new Date(newEndTime);
      endDate.setHours(endDate.getHours() - 1);
      setStartTime(formatDateTime(endDate));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 開始時間 */}
        <div className="space-y-2">
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            開始時間
          </label>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm text-gray-700 dark:text-gray-300">日期</label>
            <input
              type="date"
              value={startTime.split('T')[0]}
              onChange={(e) => {
                const newDate = e.target.value;
                const time = startTime.split('T')[1] || '00:00';
                handleStartTimeChange({ target: { value: `${newDate}T${time}` } } as React.ChangeEvent<HTMLInputElement>);
              }}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full"
              style={{
                fontSize: '16px',
                height: '40px'
              }}
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">時間</label>
            <input
              type="time"
              value={startTime.split('T')[1] || '00:00'}
              onChange={(e) => {
                const newTime = e.target.value;
                const date = startTime.split('T')[0];
                handleStartTimeChange({ target: { value: `${date}T${newTime}` } } as React.ChangeEvent<HTMLInputElement>);
              }}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full"
              style={{
                fontSize: '16px',
                height: '40px'
              }}
            />
          </div>
        </div>

        {/* 結束時間 */}
        <div className="space-y-2">
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            結束時間
          </label>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm text-gray-700 dark:text-gray-300">日期</label>
            <input
              type="date"
              value={endTime.split('T')[0]}
              onChange={(e) => {
                const newDate = e.target.value;
                const time = endTime.split('T')[1] || '00:00';
                handleEndTimeChange({ target: { value: `${newDate}T${time}` } } as React.ChangeEvent<HTMLInputElement>);
              }}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full"
              style={{
                fontSize: '16px',
                height: '40px'
              }}
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">時間</label>
            <input
              type="time"
              value={endTime.split('T')[1] || '00:00'}
              onChange={(e) => {
                const newTime = e.target.value;
                const date = endTime.split('T')[0];
                handleEndTimeChange({ target: { value: `${date}T${newTime}` } } as React.ChangeEvent<HTMLInputElement>);
              }}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full"
              style={{
                fontSize: '16px',
                height: '40px'
              }}
            />
          </div>
        </div>
      </div>

      {/* 顯示選擇的時間範圍 */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-600 p-2 rounded">
        <div>開始：{startTime ? new Date(startTime).toLocaleString('zh-TW') : '未選擇'}</div>
        <div>結束：{endTime ? new Date(endTime).toLocaleString('zh-TW') : '未選擇'}</div>
      </div>
    </div>
  );
};

export default TimeRangePicker;
