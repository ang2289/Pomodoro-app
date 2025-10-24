import React from 'react';

interface Task {
  id: string
  title: string
  description?: string
  category: string
  priority: '低' | '中' | '高'
  date: string
  startHour: string
  startMinute: string
  endHour: string
  endMinute: string
  reminder: string
  remindBeforeMinutes?: number
  status: '未開始' | '進行中' | '已完成'
}

interface TaskCardProps {
  task: Task
  onToggleStatus: (id: string) => void
  onDelete?: (id: string, title: string) => void
  getCategoryColor: (category: string) => string
  getCategoryName: (category: string) => string
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onToggleStatus, 
  onDelete,
  getCategoryColor, 
  getCategoryName 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl mb-3 shadow-sm text-sm p-4">
      {/* 頂部：勾選框+任務名稱 | 狀態 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={task.status === '已完成'}
            onChange={() => onToggleStatus(task.id)}
            className="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-0 flex-shrink-0"
            style={{ accentColor: '#3b82f6' }}
          />
          <div className="flex-1 min-w-0">
            <div className={`font-bold text-lg truncate ${
              task.status === '已完成' 
                ? 'line-through text-gray-500 dark:text-gray-400' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {task.title && task.title.trim() ? task.title : '（未命名任務）'}
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${
          task.status === '已完成' 
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
            : task.status === '進行中'
            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }`}>
          {task.status}
        </div>
      </div>

      {/* 任務內容：獨立一行，置於標題下方，避免與右側狀態同列擠壓 */}
      {(task.description?.trim() || task.title?.trim()) && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3 break-words">
          {task.description?.trim() || task.title}
        </div>
      )}
      
      {/* 任務資訊 Grid 兩欄 */}
      <div className="grid grid-cols-2 gap-3 mb-4 flex-wrap">
        {/* 分類 */}
        <div className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full flex-shrink-0 border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: getCategoryColor(task.category) }}
          ></span>
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {getCategoryName(task.category)}
          </span>
        </div>
        
        {/* 優先順序 */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">優先順序：</span>
          <span className={`ml-1 ${
            task.priority === '高' 
              ? 'text-red-600 dark:text-red-400' 
              : task.priority === '中'
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-green-600 dark:text-green-400'
          }`}>
            {task.priority}
          </span>
        </div>
        
        {/* 日期 */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">日期：</span>
          <span className="ml-1">{task.date || '未設定'}</span>
        </div>
        
        {/* 時間 */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">時間：</span>
          <span className="ml-1">
            {task.startHour && task.startMinute 
              ? `${task.startHour}:${task.startMinute.padStart(2, '0')} - ${task.endHour}:${task.endMinute.padStart(2, '0')}`
              : '未設定'
            }
          </span>
        </div>
      </div>
      
      {/* 提醒設定 */}
      {(task.reminder && task.reminder !== '0') || task.remindBeforeMinutes ? (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="font-medium">提醒：</span>
          <span className="ml-1">任務開始前 {task.remindBeforeMinutes || Number(task.reminder)} 分鐘</span>
        </div>
      ) : null}

      {/*（已移除重複任務顯示）*/}
      
      {/* 底部：刪除按鈕 */}
      {onDelete && (
        <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-700">
          <button 
            onClick={() => onDelete(task.id, task.title)}
            className="bg-red-500 hover:bg-red-600 text-white text-sm flex items-center gap-1 px-3 py-2 rounded-lg shadow transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] border-0"
            style={{ background: '#ef4444', color: '#fff', border: 'none' }}
          >
            🗑️ 刪除
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
