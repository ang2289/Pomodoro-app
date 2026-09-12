import React from 'react';

interface TimeInputProps {
  selectedDate: Date | null;
  selectedHour: number;
  selectedMinute: number;
  onDateChange: (date: Date | null) => void;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  placeholder?: string;
  className?: string;
}

export default function TimeInput({
  selectedDate,
  selectedHour,
  selectedMinute,
  onDateChange,
  onHourChange,
  onMinuteChange,
  placeholder = "選擇日期和時間",
  className = ""
}: TimeInputProps) {

  // 格式化顯示的時間
  const formatTime = () => {
    if (selectedDate) {
      const dateStr = selectedDate.toLocaleDateString('zh-TW');
      const timeStr = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
      return `${dateStr} ${timeStr}`;
    }
    return placeholder;
  };

  // 格式化日期為 YYYY-MM-DD 格式
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 格式化時間為 HH:MM 格式
  const formatTimeForInput = (hour: number, minute: number): string => {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  // 處理日期變更
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const newDate = new Date(dateValue);
      newDate.setHours(selectedHour, selectedMinute, 0, 0);
      onDateChange(newDate);
    } else {
      onDateChange(null);
    }
  };

  // 處理時間變更
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (timeValue) {
      const [hour, minute] = timeValue.split(':').map(Number);
      onHourChange(hour);
      onMinuteChange(minute);
      
      // 如果有選中的日期，更新完整的日期時間
      if (selectedDate) {
        const newDate = new Date(selectedDate);
        newDate.setHours(hour, minute, 0, 0);
        onDateChange(newDate);
      }
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 原生日期和時間選擇器 */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-sm text-gray-700">日期</label>
        <input 
          type="date" 
          value={formatDateForInput(selectedDate)}
          onChange={handleDateChange}
          className="border border-gray-300 rounded px-2 py-1 w-full"
          style={{
            fontSize: '16px',
            height: '40px'
          }}
        />

        <label className="text-sm text-gray-700">時間</label>
        <input 
          type="time" 
          value={formatTimeForInput(selectedHour, selectedMinute)}
          onChange={handleTimeChange}
          className="border border-gray-300 rounded px-2 py-1 w-full"
          style={{
            fontSize: '16px',
            height: '40px'
          }}
        />
      </div>
      
      {/* 顯示當前選擇的時間 */}
      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
        選擇時間：{formatTime()}
      </div>
    </div>
  );
}

