import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { exportTodosToCSVWithCapacitor } from '../services/todoCsvExportService'
import IconButton from './ui/IconButton'
import { Download } from 'lucide-react'

// 待辦任務介面
interface Todo {
  id: string
  title: string
  description?: string
  category: string
  priority: string | '低' | '中' | '高'
  date: string
  startHour: string
  startMinute: string
  endHour: string
  endMinute: string
  reminder: string
  remindBeforeMinutes?: number
  status: string | '未開始' | '進行中' | '已完成'
}

// 分類介面
interface Category {
  id: string
  name: string
  color: string
  isDefault?: boolean
}

interface TodoExportButtonProps {
  todos: Todo[]
  categories: Category[]
}

const TodoExportButton: React.FC<TodoExportButtonProps> = ({ todos, categories }) => {
  const { t } = useTranslation()
  const [exportStatus, setExportStatus] = useState({
    show: false,
    type: 'success' as 'success' | 'error',
    message: ''
  })

  const handleExportTodos = async () => {
    try {
      const result = await exportTodosToCSVWithCapacitor(todos, categories)
      
      if (result.success) {
        setExportStatus({
          show: true,
          type: 'success',
          message: result.message
        })
        
        // 顯示 alert 提示使用者檔案已儲存
        alert(result.message)
        
        setTimeout(() => {
          setExportStatus(prev => ({ ...prev, show: false }))
        }, 5000)
      } else {
        setExportStatus({
          show: true,
          type: 'error',
          message: result.message
        })
        setTimeout(() => {
          setExportStatus(prev => ({ ...prev, show: false }))
        }, 3000)
      }
    } catch (error) {
      console.error(t('export_failed') + ':', error)
      setExportStatus({
        show: true,
        type: 'error',
        message: t('export_failed_try_again')
      })
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, show: false }))
      }, 3000)
    }
  }

  return (
    <div className="mb-4">
      {/* 匯出狀態提示 */}
      {exportStatus.show && exportStatus.type === 'success' && (
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          border: '1px solid #c3e6cb',
          marginBottom: '10px'
        }}>
          ✅ {exportStatus.message}
        </div>
      )}
      
      {exportStatus.show && exportStatus.type === 'error' && (
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          border: '1px solid #f5c6cb',
          marginBottom: '10px'
        }}>
          ❌ {exportStatus.message}
        </div>
      )}
      
      {/* 匯出按鈕 */}
      <IconButton
        icon={<Download size={16} />}
        label={t('export_todo_records_csv')}
        onClick={handleExportTodos}
        onTouchEnd={(e) => {
          // 防止觸控事件重複觸發
          e.preventDefault();
          e.stopPropagation();
          console.log('觸發待辦記錄CSV匯出 - 觸控事件');
          handleExportTodos();
        }}
        onTouchStart={(e) => {
          // 防止觸控事件重複觸發
          e.preventDefault();
          console.log('觸控開始 - 待辦記錄CSV匯出');
        }}
        variant="primary"
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
      />
    </div>
  )
}

export default TodoExportButton
